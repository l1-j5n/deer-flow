"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphTransferPage() {
  const [activeTab, setActiveTab] = useState("multitask");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Multi-task state
  const [multitaskType, setMultitaskType] = useState("joint");
  const [tasks, setTasks] = useState(["classification", "regression"]);
  const [hiddenDim, setHiddenDim] = useState(64);
  const [sharedLayers, setSharedLayers] = useState(2);
  const [multitaskResult, setMultitaskResult] = useState<any>(null);

  // Meta state
  const [metalearnType, setMetalearnType] = useState("maml");
  const [numTasks, setNumTasks] = useState(5);
  const [innerSteps, setInnerSteps] = useState(5);
  const [outerLr, setOuterLr] = useState(0.001);
  const [metaResult, setMetaResult] = useState<any>(null);

  // Transfer state
  const [transferType, setTransferType] = useState("finetune");
  const [sourceTasks, setSourceTasks] = useState<string[]>([]);
  const [targetTasks, setTargetTasks] = useState<string[]>([]);
  const [freezeLayers, setFreezeLayers] = useState(1);
  const [transferResult, setTransferResult] = useState<any>(null);

  const runMultitask = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/multitask/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, multitask_type: multitaskType, tasks, hidden_dim: hiddenDim, shared_layers: sharedLayers }),
      });
      setMultitaskResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runMeta = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/metalearn/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, metalearn_type: metalearnType, num_tasks: numTasks, inner_steps: innerSteps, outer_lr: outerLr }),
      });
      setMetaResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runTransfer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/transfer/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, transfer_type: transferType, source_tasks: sourceTasks, target_tasks: targetTasks, freeze_layers: freezeLayers }),
      });
      setTransferResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Transfer</h1>
          <p className="text-muted-foreground">Multi-task, Meta & Transfer Learning</p>
        </div>
        <Badge variant="outline">v1.73</Badge>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="multitask">Multi-task</TabsTrigger>
          <TabsTrigger value="metalearn">Meta-learning</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
        <TabsContent value="multitask">
          <Card>
            <CardHeader><CardTitle>Multi-task Learning</CardTitle><CardDescription>Learn multiple tasks jointly</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={multitaskType} onChange={(e) => setMultitaskType(e.target.value)}><option value="joint">Joint</option><option value="hierarchical">Hierarchical</option><option value="progressive">Progressive</option></select></div>
                <div><Label>Hidden Dim</Label><Input type="number" value={hiddenDim} onChange={(e) => setHiddenDim(parseInt(e.target.value))} /></div>
                <div><Label>Shared Layers</Label><Input type="number" value={sharedLayers} onChange={(e) => setSharedLayers(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runMultitask} disabled={loading}>{loading ? "Learning..." : "Run Multi-task"}</Button>
              {multitaskResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(multitaskResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="metalearn">
          <Card>
            <CardHeader><CardTitle>Meta-learning</CardTitle><CardDescription>Learn to learn quickly</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={metalearnType} onChange={(e) => setMetalearnType(e.target.value)}><option value="maml">MAML</option><option value="reptile">Reptile</option><option value="RelationNet">RelationNet</option></select></div>
                <div><Label>Num Tasks</Label><Input type="number" value={numTasks} onChange={(e) => setNumTasks(parseInt(e.target.value))} /></div>
                <div><Label>Inner Steps</Label><Input type="number" value={innerSteps} onChange={(e) => setInnerSteps(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runMeta} disabled={loading}>{loading ? "Learning..." : "Run Meta-learning"}</Button>
              {metaResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(metaResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transfer">
          <Card>
            <CardHeader><CardTitle>Transfer Learning</CardTitle><CardDescription>Transfer knowledge between tasks</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={transferType} onChange={(e) => setTransferType(e.target.value)}><option value="finetune">Fine-tune</option><option value="features">Features</option><option value="adapter">Adapter</option></select></div>
                <div><Label>Freeze Layers</Label><Input type="number" value={freezeLayers} onChange={(e) => setFreezeLayers(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runTransfer} disabled={loading}>{loading ? "Transferring..." : "Run Transfer"}</Button>
              {transferResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(transferResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}