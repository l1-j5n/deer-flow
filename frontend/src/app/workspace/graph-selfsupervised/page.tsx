"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphSelfSupervisedPage() {
  const [activeTab, setActiveTab] = useState("selfsupervised");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Self-supervised
  const [method, setMethod] = useState("mask");
  const [maskRatio, setMaskRatio] = useState(0.15);
  const [hiddenDim, setHiddenDim] = useState(64);
  const [selfSupResult, setSelfSupResult] = useState<any>(null);

  // Pre-train
  const [pretrainType, setPretrainType] = useState("contrastive");
  const [epochs, setEpochs] = useState(100);
  const [pretrainResult, setPretrainResult] = useState<any>(null);

  // Distillation
  const [distillType, setDistillType] = useState("feature");
  const [teacherHidden, setTeacherHidden] = useState(128);
  const [studentHidden, setStudentHidden] = useState(64);
  const [temperature, setTemperature] = useState(3.0);
  const [distillResult, setDistillResult] = useState<any>(null);

  const runSelfSup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/selfsupervised/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, method, mask_ratio: maskRatio, hidden_dim: hiddenDim }),
      });
      setSelfSupResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runPreTrain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/pretrain/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, pretrain_type: pretrainType, epochs, hidden_dim: hiddenDim }),
      });
      setPretrainResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runDistill = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/distillation/distill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, distill_type: distillType, teacher_hidden: teacherHidden, student_hidden: studentHidden, temperature }),
      });
      setDistillResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Advanced Training</h1>
          <p className="text-muted-foreground">Self-supervised, Pre-training & Distillation</p>
        </div>
        <Badge variant="outline">v1.74</Badge>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="selfsupervised">Self-supervised</TabsTrigger>
          <TabsTrigger value="pretrain">Pre-training</TabsTrigger>
          <TabsTrigger value="distillation">Distillation</TabsTrigger>
        </TabsList>
        <TabsContent value="selfsupervised">
          <Card>
            <CardHeader><CardTitle>Self-supervised Learning</CardTitle><CardDescription>Learn without labels</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Method</Label><select className="w-full h-10" value={method} onChange={(e) => setMethod(e.target.value)}><option value="mask">Mask</option><option value="edge">Edge</option><option value="attribute">Attribute</option></select></div>
                <div><Label>Mask Ratio</Label><Input type="number" step="0.05" value={maskRatio} onChange={(e) => setMaskRatio(parseFloat(e.target.value))} /></div>
                <div><Label>Hidden Dim</Label><Input type="number" value={hiddenDim} onChange={(e) => setHiddenDim(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runSelfSup} disabled={loading}>{loading ? "Learning..." : "Run Self-supervised"}</Button>
              {selfSupResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(selfSupResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pretrain">
          <Card>
            <CardHeader><CardTitle>Pre-training</CardTitle><CardDescription>Pre-train on large graphs</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={pretrainType} onChange={(e) => setPretrainType(e.target.value)}><option value="contrastive">Contrastive</option><option value="predictive">Predictive</option><option value="hybrid">Hybrid</option></select></div>
                <div><Label>Epochs</Label><Input type="number" value={epochs} onChange={(e) => setEpochs(parseInt(e.target.value))} /></div>
                <div><Label>Hidden Dim</Label><Input type="number" value={hiddenDim} onChange={(e) => setHiddenDim(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runPreTrain} disabled={loading}>{loading ? "Pre-training..." : "Run Pre-training"}</Button>
              {pretrainResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(pretrainResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="distillation">
          <Card>
            <CardHeader><CardTitle>Knowledge Distillation</CardTitle><CardDescription>Distill knowledge from teacher to student</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={distillType} onChange={(e) => setDistillType(e.target.value)}><option value="feature">Feature</option><option value="response">Response</option><option value="relation">Relation</option></select></div>
                <div><Label>Teacher Hidden</Label><Input type="number" value={teacherHidden} onChange={(e) => setTeacherHidden(parseInt(e.target.value))} /></div>
                <div><Label>Student Hidden</Label><Input type="number" value={studentHidden} onChange={(e) => setStudentHidden(parseInt(e.target.value))} /></div>
              </div>
              <Button onClick={runDistill} disabled={loading}>{loading ? "Distilling..." : "Run Distillation"}</Button>
              {distillResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(distillResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}