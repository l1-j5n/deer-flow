"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BrainCircuitIcon,
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  MessageSquareIcon,
  MemoryStickIcon,
  NetworkIcon,
  RouteIcon,
  SearchIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResultType =
  | "session"
  | "workflow"
  | "memory"
  | "entity"
  | "tool"
  | "audit"
  | "collaboration"
  | "reasoning";

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  metadata: Record<string, string>;
  timestamp: string;
  relevance: number;
}

interface SearchFilters {
  types: SearchResultType[];
  dateFrom?: string;
  dateTo?: string;
  minRelevance: number;
}

const typeConfig: Record<
  SearchResultType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  session: {
    label: "Session",
    icon: <MessageSquareIcon className="size-4" />,
    color: "bg-blue-500",
  },
  workflow: {
    label: "Workflow",
    icon: <RouteIcon className="size-4" />,
    color: "bg-orange-500",
  },
  memory: {
    label: "Memory",
    icon: <MemoryStickIcon className="size-4" />,
    color: "bg-purple-500",
  },
  entity: {
    label: "Entity",
    icon: <NetworkIcon className="size-4" />,
    color: "bg-green-500",
  },
  tool: {
    label: "Tool",
    icon: <WrenchIcon className="size-4" />,
    color: "bg-cyan-500",
  },
  audit: {
    label: "Audit",
    icon: <ShieldIcon className="size-4" />,
    color: "bg-red-500",
  },
  collaboration: {
    label: "Collaboration",
    icon: <UsersIcon className="size-4" />,
    color: "bg-pink-500",
  },
  reasoning: {
    label: "Reasoning",
    icon: <BrainCircuitIcon className="size-4" />,
    color: "bg-yellow-500",
  },
};

function generateMockResults(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const results: SearchResult[] = [
    {
      id: "s1",
      type: "session",
      title: "Research Assistant Session",
      description: `Session about "${query}" with multiple tool calls and reasoning steps.`,
      metadata: { messages: "12", tools: "3", duration: "2m 34s" },
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      relevance: 0.92,
    },
    {
      id: "w1",
      type: "workflow",
      title: "Data Processing Pipeline",
      description: `Workflow that processed "${query}" through multiple stages.`,
      metadata: { status: "completed", steps: "5", duration: "1.2s" },
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      relevance: 0.85,
    },
    {
      id: "m1",
      type: "memory",
      title: "User Preference: API Keys",
      description: `Memory related to "${query}" configuration and settings.`,
      metadata: { confidence: "0.95", type: "preference", access: "12" },
      timestamp: new Date(Date.now() - 604800000).toISOString(),
      relevance: 0.78,
    },
    {
      id: "e1",
      type: "entity",
      title: "LangGraph Framework",
      description: `Knowledge entity matching "${query}" in technology category.`,
      metadata: { type: "technology", confidence: "0.88", relations: "5" },
      timestamp: new Date(Date.now() - 2592000000).toISOString(),
      relevance: 0.71,
    },
    {
      id: "t1",
      type: "tool",
      title: "web_search",
      description: `Tool used to search for "${query}" on the web.`,
      metadata: { category: "web", calls: "45", success: "98%" },
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      relevance: 0.68,
    },
    {
      id: "a1",
      type: "audit",
      title: "Model Configuration Changed",
      description: `Audit event related to "${query}" system configuration.`,
      metadata: { category: "config", severity: "info", actor: "admin" },
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      relevance: 0.55,
    },
    {
      id: "c1",
      type: "collaboration",
      title: "Multi-Agent Research Team",
      description: `Collaboration session involving "${query}" analysis.`,
      metadata: { agents: "4", tasks: "8", status: "completed" },
      timestamp: new Date(Date.now() - 1209600000).toISOString(),
      relevance: 0.48,
    },
    {
      id: "r1",
      type: "reasoning",
      title: "ReAct Trace: Problem Solving",
      description: `Reasoning trace for "${query}" using ReAct strategy.`,
      metadata: { strategy: "ReAct", steps: "7", confidence: "0.82" },
      timestamp: new Date(Date.now() - 518400000).toISOString(),
      relevance: 0.42,
    },
  ];
  return results;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: Object.keys(typeConfig) as SearchResultType[],
    minRelevance: 0,
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "agent configuration",
    "workflow errors",
    "security alerts",
    "memory pruning",
  ]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      // Simulate search delay
      await new Promise((r) => setTimeout(r, 500));
      const allResults = generateMockResults(searchQuery);
      const filtered = allResults.filter(
        (r) =>
          filters.types.includes(r.type) && r.relevance >= filters.minRelevance
      );
      setResults(filtered);
      setLoading(false);
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches((prev) => [searchQuery, ...prev].slice(0, 8));
      }
    },
    [filters, recentSearches]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  const toggleType = (type: SearchResultType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const clearFilters = () => {
    setFilters({
      types: Object.keys(typeConfig) as SearchResultType[],
      minRelevance: 0,
    });
  };

  const filteredResults = results;
  const groupedByType = filteredResults.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SearchIcon className="size-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Advanced Search</h1>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute left-3 top-3 size-5" />
          <Input
            placeholder="Search across all modules..."
            className="h-12 pl-10 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => setQuery("")}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          className="h-12 px-4"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontalIcon className="mr-2 size-4" />
          Filters
          {filters.types.length < 8 && (
            <Badge className="ml-2 bg-primary text-[10px] text-white">
              {filters.types.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Recent:</span>
          {recentSearches.map((s) => (
            <Button
              key={s}
              variant="secondary"
              size="sm"
              onClick={() => setQuery(s)}
            >
              <ClockIcon className="mr-1 size-3" />
              {s}
            </Button>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Result Types</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(typeConfig) as SearchResultType[]).map((type) => {
                  const config = typeConfig[type];
                  const active = filters.types.includes(type);
                  return (
                    <Button
                      key={type}
                      variant={active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleType(type)}
                      className="gap-1"
                    >
                      {config.icon}
                      <span>{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">
                Min Relevance: {filters.minRelevance}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minRelevance * 100}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minRelevance: parseInt(e.target.value) / 100,
                  }))
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {query && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {loading ? "Searching..." : `${filteredResults.length} results`}
          </span>
          {Object.entries(groupedByType).map(([type, items]) => (
            <Badge key={type} variant="outline" className="text-[10px]">
              {typeConfig[type as SearchResultType].label}: {items.length}
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : query && filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <SearchIcon className="text-muted-foreground mb-4 size-12" />
          <p className="text-muted-foreground">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredResults.map((result) => {
            const config = typeConfig[result.type];
            return (
              <div
                key={result.id}
                className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.color} text-white`}
                >
                  {config.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {result.title}
                    </span>
                    <Badge className={`${config.color} text-[10px] text-white`}>
                      {config.label}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {(result.relevance * 100).toFixed(0)}% match
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {result.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {Object.entries(result.metadata).map(([key, value]) => (
                      <span key={key} className="flex items-center gap-1">
                        <FilterIcon className="size-3" />
                        {key}: {value}
                      </span>
                    ))}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
