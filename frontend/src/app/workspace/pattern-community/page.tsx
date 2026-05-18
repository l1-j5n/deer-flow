"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "";

interface PatternMatch {
  from_entity: string;
  from_type: string;
  relation_type: string;
  to_entity: string;
  to_type: string;
}

interface PatternResult {
  patterns: PatternMatch[];
  count: number;
}

interface SubgraphResult {
  entities: Record<string, unknown>;
  relations: Record<string, unknown>;
  entity_count: number;
  relation_count: number;
}

interface PatternSummary {
  entity_type_counts: Record<string, number>;
  relation_type_counts: Record<string, number>;
  cached_patterns: number;
}

interface Community {
  size: number;
  internal_relations: number;
  external_relations: number;
  type_distribution: Record<string, number>;
}

interface CommunityResult {
  communities: Record<string, Community>;
}

interface CommunitySummary {
  communities: Record<string, string[]>;
  community_count: number;
  cached_communities: number;
}

interface CentralityScore {
  entity: string;
  score: number;
}

interface CentralityResult {
  method: string;
  top_entities: CentralityScore[];
  total_calculated: number;
}

interface CentralityCompare {
  comparisons: Record<string, CentralityScore[]>;
}

interface EntityCentrality {
  entity: string;
  degree_centrality: number;
  betweenness_centrality: number;
  closeness_centrality: number;
  pagerank: number;
}

export default function PatternCommunityPage() {
  const [activeTab, setActiveTab] = useState("pattern");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pattern state
  const [entityTypes, setEntityTypes] = useState("");
  const [relationTypes, setRelationTypes] = useState("");
  const [maxResults, setMaxResults] = useState(100);
  const [patternResult, setPatternResult] = useState<PatternResult | null>(null);
  const [subgraphResult, setSubgraphResult] = useState<SubgraphResult | null>(null);
  const [patternSummary, setPatternSummary] = useState<PatternSummary | null>(null);
  const [entityIds, setEntityIds] = useState("");

  // Community state
  const [algorithm, setAlgorithm] = useState("louvain");
  const [minSize, setMinSize] = useState(2);
  const [maxCommunities, setMaxCommunities] = useState(10);
  const [communityResult, setCommunityResult] = useState<CommunityResult | null>(null);
  const [communitySummary, setCommunitySummary] = useState<CommunitySummary | null>(null);

  // Centrality state
  const [centralityMethod, setCentralityMethod] = useState("degree");
  const [topK, setTopK] = useState(10);
  const [centralityResult, setCentralityResult] = useState<CentralityResult | null>(null);
  const [centralityCompare, setCentralityCompare] = useState<CentralityCompare | null>(null);
  const [entityCentrality, setEntityCentrality] = useState<EntityCentrality | null>(null);
  const [targetEntity, setTargetEntity] = useState("");

  // Pattern Functions
  const findPatterns = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/pattern/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_types: entityTypes.split(",").filter(Boolean),
          relation_types: relationTypes.split(",").filter(Boolean),
          max_results: maxResults,
        }),
      });
      const data = await res.json();
      setPatternResult(data);
    } catch (e) {
      setError("Failed to find patterns");
    }
    setLoading(false);
  };

  const extractSubgraph = async () => {
    setLoading(true);
    setError("");
    try {
      const ids = entityIds.split(",").filter(Boolean);
      const res = await fetch(`${API_BASE}/api/knowledge-graph/pattern/subgraph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_ids: ids,
          include_relations: true,
          depth: 1,
        }),
      });
      const data = await res.json();
      setSubgraphResult(data);
    } catch (e) {
      setError("Failed to extract subgraph");
    }
    setLoading(false);
  };

  const getPatternSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/pattern/summary`);
      const data = await res.json();
      setPatternSummary(data);
    } catch (e) {
      console.error("Failed to get pattern summary");
    }
  };

  // Community Functions
  const detectCommunities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/community/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          algorithm,
          min_community_size: minSize,
          max_communities: maxCommunities,
        }),
      });
      const data = await res.json();
      setCommunityResult(data);
    } catch (e) {
      setError("Failed to detect communities");
    }
    setLoading(false);
  };

  const getCommunitySummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/community/summary`);
      const data = await res.json();
      setCommunitySummary(data);
    } catch (e) {
      console.error("Failed to get community summary");
    }
  };

  // Centrality Functions
  const calculateCentrality = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/centrality/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: centralityMethod,
          top_k: topK,
        }),
      });
      const data = await res.json();
      setCentralityResult(data);
    } catch (e) {
      setError("Failed to calculate centrality");
    }
    setLoading(false);
  };

  const compareCentrality = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/centrality/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "degree",  // reused as top_k
          top_k: topK,
        }),
      });
      const data = await res.json();
      setCentralityCompare(data);
    } catch (e) {
      setError("Failed to compare centrality");
    }
    setLoading(false);
  };

  const getEntityCentrality = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/centrality/entity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: targetEntity,
        }),
      });
      const data = await res.json();
      setEntityCentrality(data);
    } catch (e) {
      setError("Failed to get entity centrality");
    }
    setLoading(false);
  };

  // Load summaries on mount
  useEffect(() => {
    getPatternSummary();
    getCommunitySummary();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pattern & Community Analysis</h1>
          <p className="text-muted-foreground">
            Graph pattern matching, community detection, and centrality metrics
          </p>
        </div>
        <Badge variant="outline">v1.54</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pattern">Pattern</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="centrality">Centrality</TabsTrigger>
        </TabsList>

        {/* Pattern Tab */}
        <TabsContent value="pattern">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Patterns</CardTitle>
                <CardDescription>Find entities matching type patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Entity Types (comma-separated)</Label>
                  <Input
                    value={entityTypes}
                    onChange={(e) => setEntityTypes(e.target.value)}
                    placeholder="Person, Organization"
                  />
                </div>
                <div>
                  <Label>Relation Types (comma-separated)</Label>
                  <Input
                    value={relationTypes}
                    onChange={(e) => setRelationTypes(e.target.value)}
                    placeholder="KNOWS, WORKS_AT"
                  />
                </div>
                <div>
                  <Label>Max Results</Label>
                  <Input
                    type="number"
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                  />
                </div>
                <Button onClick={findPatterns} disabled={loading}>
                  Find Patterns
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Extract Subgraph</CardTitle>
                <CardDescription>Extract subgraph around entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Entity IDs (comma-separated)</Label>
                  <Input
                    value={entityIds}
                    onChange={(e) => setEntityIds(e.target.value)}
                    placeholder="entity1, entity2"
                  />
                </div>
                <Button onClick={extractSubgraph} disabled={loading}>
                  Extract Subgraph
                </Button>
              </CardContent>
            </Card>

            {/* Pattern Summary */}
            {patternSummary && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Graph Type Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Entity Types</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(patternSummary.entity_type_counts).map(
                          ([type, count]) => (
                            <Badge key={type} variant="outline">
                              {type}: {count}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Relation Types</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(patternSummary.relation_type_counts).map(
                          ([type, count]) => (
                            <Badge key={type} variant="secondary">
                              {type}: {count}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pattern Result */}
            {patternResult && patternResult.count > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Pattern Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Found {patternResult.count} matches</p>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {patternResult.patterns.slice(0, 20).map((match, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 border rounded"
                        >
                          <Badge variant="outline">{match.from_type}</Badge>
                          <span className="font-mono text-sm">{match.from_entity}</span>
                          <Badge>→</Badge>
                          <Badge variant="secondary">{match.relation_type}</Badge>
                          <Badge>→</Badge>
                          <span className="font-mono text-sm">{match.to_entity}</span>
                          <Badge variant="outline">{match.to_type}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Subgraph Result */}
            {subgraphResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Subgraph</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold text-2xl">{subgraphResult.entity_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relations</p>
                      <p className="font-bold text-2xl">{subgraphResult.relation_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detect Communities</CardTitle>
                <CardDescription>Detect communities in the graph</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Algorithm</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                  >
                    <option value="louvain">Louvain</option>
                    <option value="label_propagation">Label Propagation</option>
                    <option value="greedy">Greedy</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Community Size</Label>
                    <Input
                      type="number"
                      value={minSize}
                      onChange={(e) => setMinSize(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Max Communities</Label>
                    <Input
                      type="number"
                      value={maxCommunities}
                      onChange={(e) => setMaxCommunities(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button onClick={detectCommunities} disabled={loading}>
                  Detect Communities
                </Button>
              </CardContent>
            </Card>

            {/* Community Summary */}
            {communitySummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Communities</p>
                      <p className="font-bold text-2xl">
                        {communitySummary.community_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cached</p>
                      <p className="font-bold">{communitySummary.cached_communities}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Result */}
            {communityResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Community Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {Object.entries(communityResult.communities).map(
                        ([commId, details], idx) => (
                          <div key={idx} className="p-3 border rounded">
                            <div className="flex justify-between mb-2">
                              <Badge>Community {idx + 1}</Badge>
                              <span>Size: {details.size}</span>
                            </div>
                            <div className="flex gap-2 text-sm">
                              <span>Internal: {details.internal_relations}</span>
                              <span>External: {details.external_relations}</span>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {Object.entries(details.type_distribution).map(
                                ([type, count]) => (
                                  <Badge key={type} variant="outline">
                                    {type}: {count}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Centrality Tab */}
        <TabsContent value="centrality">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Centrality</CardTitle>
                <CardDescription>Calculate centrality metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={centralityMethod}
                    onChange={(e) => setCentralityMethod(e.target.value)}
                  >
                    <option value="degree">Degree</option>
                    <option value="betweenness">Betweenness</option>
                    <option value="closeness">Closeness</option>
                    <option value="pagerank">PageRank</option>
                  </select>
                </div>
                <div>
                  <Label>Top K</Label>
                  <Input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={calculateCentrality} disabled={loading}>
                    Calculate
                  </Button>
                  <Button onClick={compareCentrality} disabled={loading} variant="outline">
                    Compare All
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Centrality</CardTitle>
                <CardDescription>Get centrality for a specific entity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <Button onClick={getEntityCentrality} disabled={loading}>
                  Get Centrality
                </Button>
              </CardContent>
            </Card>

            {/* Centrality Result */}
            {centralityResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top {centralityResult.method} Centrality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    Total calculated: {centralityResult.total_calculated}
                  </p>
                  <div className="space-y-2">
                    {centralityResult.top_entities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <div className="flex gap-2">
                          <Badge variant="outline">{idx + 1}</Badge>
                          <span className="font-mono">{item.entity}</span>
                        </div>
                        <Badge>{item.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Centrality Compare */}
            {centralityCompare && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Centrality Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(centralityCompare.comparisons).map(
                      ([method, scores]) => (
                        <div key={method}>
                          <p className="font-semibold mb-2">{method}</p>
                          <div className="flex gap-2 flex-wrap">
                            {scores.map((item, idx) => (
                              <Badge key={idx} variant="outline">
                                {item.entity}: {item.score}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entity Centrality */}
            {entityCentrality && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Entity: {entityCentrality.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Degree</p>
                      <p className="font-bold">{entityCentrality.degree_centrality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Betweenness</p>
                      <p className="font-bold">{entityCentrality.betweenness_centrality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Closeness</p>
                      <p className="font-bold">{entityCentrality.closeness_centrality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PageRank</p>
                      <p className="font-bold">{entityCentrality.pagerank}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}