"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

const API_BASE = "";

interface SearchResult {
  entity_id: string;
  title: string;
  snippet: string;
  score: number;
}

interface EntityVersion {
  version_id: string;
  entity_id: string;
  version_number: number;
  created_at: string;
}

interface AlgorithmResult {
  algorithm: string;
  result: Record<string, unknown>;
  execution_time_ms: number;
}

export default function VersionAdvancedPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [versions, setVersions] = useState<EntityVersion[]>([]);
  const [algoResults, setAlgoResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [entityId, setEntityId] = useState("");

  // Advanced search
  const doSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kg/search/advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          page_size: 10
        }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("Search failed:", e);
    }
    setLoading(false);
  };

  // Get search suggestions
  const loadSuggestions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/search/suggest?prefix=${searchQuery || "a"}&limit=5`);
      const suggestions = await res.json();
    } catch (e) {
      console.error("Failed to load suggestions:", e);
    }
  }, [searchQuery]);

  // Graph algorithms
  const runAlgorithm = async (algo: string) => {
    setLoading(true);
    try {
      const endpoint = `/api/kg/algorithms/${algo}`;
      let res;
      if (algo === "pagerank") {
        res = await fetch(endpoint, { method: "POST" });
      } else if (algo === "clustering") {
        res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ num_clusters: 3 }) });
      } else if (algo === "centrality") {
        res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 10 }) });
      } else if (algo === "connected-components" || algo === "cycles") {
        res = await fetch(endpoint, { method: "POST" });
      } else {
        res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: "node_a", target: "node_z" }) });
      }
      setAlgoResults(await res.json());
    } catch (e) {
      console.error(`Failed to run ${algo}:`, e);
    }
    setLoading(false);
  };

  // Entity versioning
  const loadVersions = async () => {
    if (!entityId.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/kg/entities/${entityId}/versions?limit=10`);
      const data = await res.json();
      setVersions(data.versions || []);
    } catch (e) {
      console.error("Failed to load versions:", e);
    }
  };

  // Create new version
  const createVersion = async () => {
    if (!entityId.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/entities/${entityId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: entityId,
          data: { key: "value" },
          created_by: "user"
        }),
      });
      loadVersions();
    } catch (e) {
      console.error("Failed to create version:", e);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Advanced Features
          </h1>
          <p className="text-muted-foreground mt-1">
            Graph algorithms, entity versioning, and advanced search
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v1.46
        </Badge>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        {/* Advanced Search Tab */}
        <TabsContent value="search">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Search</CardTitle>
                <CardDescription>Advanced search with filters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Query</Label>
                  <Input
                    placeholder="Enter search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={doSearch} disabled={loading} className="flex-1">
                    Search
                  </Button>
                  <Button variant="outline" onClick={loadSuggestions}>
                    Suggest
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">type:entity</Badge>
                    <Badge variant="outline">status:active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>{searchResults.length} results found</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {searchResults.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Enter a query and search
                      </p>
                    ) : (
                      searchResults.map((result) => (
                        <div key={result.entity_id} className="p-3 border rounded-lg hover:bg-accent/50">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{result.title}</div>
                            <Badge>{(result.score * 100).toFixed(0)}%</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {result.snippet}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Algorithms Tab */}
        <TabsContent value="algorithms">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Graph Algorithms</CardTitle>
                <CardDescription>Run graph analysis algorithms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("bfs")}>
                  🔍 BFS Shortest Path
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("dfs")}>
                  🌲 DFS Path Finding
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("dijkstra")}>
                  📊 Dijkstra SP
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("clustering")}>
                  🎯 Clustering
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("centrality")}>
                  ⭐ Centrality
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("pagerank")}>
                  📈 PageRank
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("connected-components")}>
                  🔗 Connected Components
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => runAlgorithm("cycles")}>
                  🔄 Cycle Detection
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Algorithm execution results</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(algoResults).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Select an algorithm to run
                  </p>
                ) : (
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-xs">
                    {JSON.stringify(algoResults, null, 2)}
                  </pre>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Versioning Tab */}
        <TabsContent value="versions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Entity Versions</CardTitle>
                <CardDescription>Create and manage entity versions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Entity ID</Label>
                  <Input
                    placeholder="Enter entity ID..."
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={loadVersions} variant="outline" className="flex-1">
                    Load
                  </Button>
                  <Button onClick={createVersion} disabled={loading} className="flex-1">
                    Create Version
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Version timeline for entity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {versions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Enter an entity ID to view versions
                      </p>
                    ) : (
                      versions.map((v) => (
                        <div key={v.version_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Badge>v{v.version_number}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(v.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}