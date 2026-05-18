"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphEthicsPage() {
  const [activeTab, setActiveTab] = useState("explainability");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Explainability
  const [explainType, setExplainType] = useState("gnn");
  const [targetNode, setTargetNode] = useState("");
  const [numSteps, setNumSteps] = useState(5);
  const [explainResult, setExplainResult] = useState<any>(null);

  // Interpretability
  const [interpretType, setInterpretType] = useState("feature");
  const [topK, setTopK] = useState(10);
  const [interpretResult, setInterpretResult] = useState<any>(null);

  // Fairness
  const [fairnessType, setFairnessType] = useState("demographic");
  const [sensitiveAttr, setSensitiveAttr] = useState("");
  const [threshold, setThreshold] = useState(0.1);
  const [fairnessResult, setFairnessResult] = useState<any>(null);

  const runExplain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/explainability/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, explain_type: explainType, target_node: targetNode, num_steps: numSteps }),
      });
      setExplainResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runInterpret = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/interpretability/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, interpret_type: interpretType, top_k: topK }),
      });
      setInterpretResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runFairness = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/fairness/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, fairness_type: fairnessType, sensitive_attr: sensitiveAttr, threshold }),
      });
      setFairnessResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Ethics</h1>
          <p className="text-muted-foreground">Explainability, Interpretability & Fairness</p>
        </div>
        <Badge variant="outline">v1.75</Badge>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="explainability">Explainability</TabsTrigger>
          <TabsTrigger value="interpretability">Interpretability</TabsTrigger>
          <TabsTrigger value="fairness">Fairness</TabsTrigger>
        </TabsList>
        <TabsContent value="explainability">
          <Card>
            <CardHeader><CardTitle>Explainability</CardTitle><CardDescription>Explain graph model predictions</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={explainType} onChange={(e) => setExplainType(e.target.value)}><option value="gnn">GNN Explainer</option><option value="grad">Gradient</option><option value="attention">Attention</option></select></div>
                <div><Label>Target Node</Label><Input value={targetNode} onChange={(e) => setTargetNode(e.target.value)} /></div>
                <div><Label>Num Steps</Label><Input type="number" value={numSteps} onChange={(e) => setNumSteps(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runExplain} disabled={loading}>{loading ? "Explaining..." : "Run Explainability"}</Button>
              {explainResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(explainResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interpretability">
          <Card>
            <CardHeader><CardTitle>Interpretability</CardTitle><CardDescription>Interpret learned representations</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={interpretType} onChange={(e) => setInterpretType(e.target.value)}><option value="feature">Feature</option><option value="neuron">Neuron</option><option value="pathway">Pathway</option></select></div>
                <div><Label>Top K</Label><Input type="number" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runInterpret} disabled={loading}>{loading ? "Interpreting..." : "Run Interpretability"}</Button>
              {interpretResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(interpretResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fairness">
          <Card>
            <CardHeader><CardTitle>Fairness</CardTitle><CardDescription>Assess model fairness</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={fairnessType} onChange={(e) => setFairnessType(e.target.value)}><option value="demographic">Demographic</option><option value="individual">Individual</option><option value="group">Group</option></select></div>
                <div><Label>Sensitive Attr</Label><Input value={sensitiveAttr} onChange={(e) => setSensitiveAttr(e.target.value)} /></div>
                <div><Label>Threshold</Label><Input type="number" step="0.05" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} /></div>
              </div>
              <Button onClick={runFairness} disabled={loading}>{loading ? "Assessing..." : "Run Fairness"}</Button>
              {fairnessResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(fairnessResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}