"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphPoolPage() {
  const [activeTab, setActiveTab] = useState("pooling");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [targetGraphId, setTargetGraphId] = useState("graph2");

  // Pooling
  const [poolingType, setPoolingType] = useState("hierarchical");
  const [ratio, setRatio] = useState(0.5);
  const [numLayers, setNumLayers] = useState(3);
  const [poolType, setPoolType] = useState("add");
  const [poolK, setPoolK] = useState(5);
  const [poolingResult, setPoolingResult] = useState<any>(null);

  // Matching
  const [matchingType, setMatchingType] = useState("isomorphism");
  const [induced, setInduced] = useState(false);
  const [matchingResult, setMatchingResult] = useState<any>(null);

  // Alignment
  const [alignmentType, setAlignmentType] = useState("node");
  const [alignK, setAlignK] = useState(5);
  const [semanticType, setSemanticType] = useState("label");
  const [alignmentResult, setAlignmentResult] = useState<any>(null);

  const runPooling = async (endpoint: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setPoolingResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runMatching = async (endpoint: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, target_graph_id: targetGraphId, ...params }),
      });
      setMatchingResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runAlignment = async (endpoint: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, target_graph_id: targetGraphId, ...params }),
      });
      setAlignmentResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Pooling & Matching</h1>
          <p className="text-muted-foreground">Pooling, Matching & Alignment Operations</p>
        </div>
        <Badge variant="outline">v1.80</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pooling">Pooling</TabsTrigger>
          <TabsTrigger value="matching">Matching</TabsTrigger>
          <TabsTrigger value="alignment">Alignment</TabsTrigger>
        </TabsList>

        <TabsContent value="pooling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graph Pooling Operations</CardTitle>
              <CardDescription>Hierarchical, Global & Node Selection Pooling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pooling Type</Label>
                  <Input value={poolingType} onChange={(e) => setPoolingType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ratio</Label>
                  <Input type="number" step="0.1" value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Target K</Label>
                  <Input type="number" value={poolK} onChange={(e) => setPoolK(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runPooling("pooling", { pooling_type: poolingType, ratio })} disabled={loading}>
                  Pool
                </Button>
                <Button onClick={() => runPooling("pooling/hierarchical", { num_layers: numLayers, ratio })} disabled={loading}>
                  Hierarchical
                </Button>
                <Button onClick={() => runPooling("pooling/global", { pool_type: poolType })} disabled={loading}>
                  Global
                </Button>
                <Button onClick={() => runPooling("pooling/select", { k: poolK, score_method: "attention" })} disabled={loading}>
                  Node Select
                </Button>
              </div>
              {poolingResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto">{JSON.stringify(poolingResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graph Matching Algorithms</CardTitle>
              <CardDescription>Isomorphism, Subgraph & Edit Distance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Graph ID</Label>
                  <Input value={targetGraphId} onChange={(e) => setTargetGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Matching Type</Label>
                  <Input value={matchingType} onChange={(e) => setMatchingType(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runMatching("matching", { matching_type: matchingType })} disabled={loading}>
                  Match
                </Button>
                <Button onClick={() => runMatching("matching/isomorphism", {})} disabled={loading}>
                  Isomorphism
                </Button>
                <Button onClick={() => runMatching("matching/subgraph", { induced })} disabled={loading}>
                  Subgraph
                </Button>
                <Button onClick={() => runMatching("matching/edit-distance", {})} disabled={loading}>
                  Edit Distance
                </Button>
                <Button onClick={() => runMatching("matching/vf2", {})} disabled={loading}>
                  VF2
                </Button>
              </div>
              {matchingResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto">{JSON.stringify(matchingResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graph Alignment Methods</CardTitle>
              <CardDescription>Node, Edge, Spectral & Semantic Alignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Graph ID</Label>
                  <Input value={targetGraphId} onChange={(e) => setTargetGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alignment Type</Label>
                  <Input value={alignmentType} onChange={(e) => setAlignmentType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Spectral K</Label>
                  <Input type="number" value={alignK} onChange={(e) => setAlignK(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runAlignment("alignment", { alignment_type: alignmentType })} disabled={loading}>
                  Align
                </Button>
                <Button onClick={() => runAlignment("alignment/node", { metric: "embedding" })} disabled={loading}>
                  Node
                </Button>
                <Button onClick={() => runAlignment("alignment/edge", {})} disabled={loading}>
                  Edge
                </Button>
                <Button onClick={() => runAlignment("alignment/spectral", { k: alignK })} disabled={loading}>
                  Spectral
                </Button>
                <Button onClick={() => runAlignment("alignment/semantic", { semantic_type: semanticType })} disabled={loading}>
                  Semantic
                </Button>
              </div>
              {alignmentResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto">{JSON.stringify(alignmentResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}