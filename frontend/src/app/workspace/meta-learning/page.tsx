"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "";

interface MetaResult {
  graph_id: string;
  algorithm: string;
  result?: {
    algorithm?: string;
    query_loss?: number;
    adapted_params?: Record<string, number>;
    theta?: number;
    theta_prime?: number;
    prototypes?: Record<string, number[]>;
    predictions?: string[];
  };
}

interface ContinuousResult {
  graph_id: string;
  entity_updates: number;
  relation_updates: number;
  replay_samples: number;
  online_lr: number;
  adapted?: boolean;
  replay_samples?: number;
}

interface SelfSupervisedResult {
  method: string;
  positive_pairs?: number;
  negative_pairs?: number;
  contrastive_loss?: number;
  masked_count?: number;
  reconstructed?: number;
  node_count?: number;
  edge_count?: number;
  reconstruction_loss?: number;
}

export default function MetaLearningPage() {
  const [activeTab, setActiveTab] = useState("meta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Meta-learning state
  const [graphId, setGraphId] = useState("graph1");
  const [algorithm, setAlgorithm] = useState("maml");
  const [supportSet, setSupportSet] = useState("[]");
  const [querySet, setQuerySet] = useState("[]");
  const [adaptationSteps, setAdaptationSteps] = useState(5);
  const [innerLr, setInnerLr] = useState(0.01);
  const [metaResult, setMetaResult] = useState<MetaResult | null>(null);
  const [metaAccuracy, setMetaAccuracy] = useState<number | null>(null);

  // Continuous learning state
  const [newEntities, setNewEntities] = useState("[]");
  const [newRelations, setNewRelations] = useState("[]");
  const [onlineLr, setOnlineLr] = useState(0.01);
  const [replayRatio, setReplayRatio] = useState(0.1);
  const [continuousResult, setContinuousResult] = useState<ContinuousResult | null>(null);

  // Self-supervised state
  const [selfMethod, setSelfMethod] = useState("contrastive");
  const [epochs, setEpochs] = useState(100);
  const [hiddenDim, setHiddenDim] = useState(64);
  const [temperature, setTemperature] = useState(0.1);
  const [selfSupervisedResult, setSelfSupervisedResult] = useState<SelfSupervisedResult | null>(null);

  // Meta-learning functions
  const runMetaLearning = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/meta/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          algorithm: algorithm,
          support_set: JSON.parse(supportSet || "[]"),
          query_set: JSON.parse(querySet || "[]"),
          adaptation_steps: adaptationSteps,
          inner_lr: innerLr,
        }),
      });
      const data = await res.json();
      setMetaResult(data);
    } catch (e) {
      setError("Failed to run meta-learning");
    }
    setLoading(false);
  };

  const adaptModel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/meta/adapt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          algorithm: algorithm,
          support_set: JSON.parse(supportSet || "[]"),
          query_set: JSON.parse(querySet || "[]"),
          adaptation_steps: adaptationSteps,
          inner_lr: innerLr,
        }),
      });
      const data = await res.json();
      setMetaResult(data);
    } catch (e) {
      setError("Failed to adapt model");
    }
    setLoading(false);
  };

  const evaluateMeta = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/meta/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          algorithm: algorithm,
          support_set: JSON.parse(supportSet || "[]"),
          query_set: JSON.parse(querySet || "[]"),
          adaptation_steps: adaptationSteps,
          inner_lr: innerLr,
        }),
      });
      const data = await res.json();
      setMetaAccuracy(data.accuracy);
    } catch (e) {
      setError("Failed to evaluate");
    }
    setLoading(false);
  };

  const getMetaSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/meta/summary`);
      const data = await res.json();
      setMetaResult({ graph_id: graphId, algorithm: "summary", result: data as any });
    } catch (e) {
      setError("Failed to get summary");
    }
    setLoading(false);
  };

  // Continuous learning functions
  const runContinuousUpdate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/continuous/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          new_entities: JSON.parse(newEntities || "[]"),
          new_relations: JSON.parse(newRelations || "[]"),
          online_lr: onlineLr,
          replay_ratio: replayRatio,
        }),
      });
      const data = await res.json();
      setContinuousResult(data);
    } catch (e) {
      setError("Failed to run continuous update");
    }
    setLoading(false);
  };

  const runReplay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/continuous/replay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          new_entities: [],
          new_relations: [],
          online_lr: onlineLr,
          replay_ratio: replayRatio,
        }),
      });
      const data = await res.json();
      setContinuousResult(data);
    } catch (e) {
      setError("Failed to run replay");
    }
    setLoading(false);
  };

  const runOnlineAdaptation = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/continuous/adapt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          new_entities: JSON.parse(newEntities || "[]"),
          new_relations: JSON.parse(newRelations || "[]"),
          online_lr: onlineLr,
          replay_ratio: 0,
        }),
      });
      const data = await res.json();
      setContinuousResult(data);
    } catch (e) {
      setError("Failed to run online adaptation");
    }
    setLoading(false);
  };

  // Self-supervised functions
  const runPretrain = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/selfsupervised/pretrain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: selfMethod,
          epochs: epochs,
          hidden_dim: hiddenDim,
          temperature: temperature,
        }),
      });
      const data = await res.json();
      setSelfSupervisedResult(data);
    } catch (e) {
      setError("Failed to run pretraining");
    }
    setLoading(false);
  };

  const runContrastive = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/selfsupervised/contrastive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: "contrastive",
          epochs: epochs,
          hidden_dim: hiddenDim,
          temperature: temperature,
        }),
      });
      const data = await res.json();
      setSelfSupervisedResult(data);
    } catch (e) {
      setError("Failed to run contrastive");
    }
    setLoading(false);
  };

  const runMasked = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/selfsupervised/masked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: "masked",
          epochs: epochs,
          hidden_dim: hiddenDim,
          temperature: 0,
        }),
      });
      const data = await res.json();
      setSelfSupervisedResult(data);
    } catch (e) {
      setError("Failed to run masked modeling");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Meta-Learning & Self-Supervised</h1>
          <p className="text-muted-foreground">
            Meta-learning, continuous learning, and self-supervised pretraining for knowledge graphs
          </p>
        </div>
        <Badge variant="outline">v1.60</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">{error}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="meta">Meta-Learning</TabsTrigger>
          <TabsTrigger value="continuous">Continuous Learning</TabsTrigger>
          <TabsTrigger value="selfsupervised">Self-Supervised</TabsTrigger>
        </TabsList>

        {/* Meta-Learning Tab */}
        <TabsContent value="meta">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meta-Learning Configuration</CardTitle>
                <CardDescription>
                  Configure MAML, Reptile, or Prototypical Networks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Graph ID</Label>
                  <Input
                    value={graphId}
                    onChange={(e) => setGraphId(e.target.value)}
                    placeholder="graph1"
                  />
                </div>
                <div>
                  <Label>Algorithm</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                  >
                    <option value="maml">MAML</option>
                    <option value="reptile">Reptile</option>
                    <option value="prototypical">Prototypical Networks</option>
                  </select>
                </div>
                <div>
                  <Label>Adaptation Steps</Label>
                  <Input
                    type="number"
                    value={adaptationSteps}
                    onChange={(e) => setAdaptationSteps(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Inner LR</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={innerLr}
                    onChange={(e) => setInnerLr(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Support Set (JSON)</Label>
                  <Textarea
                    value={supportSet}
                    onChange={(e) => setSupportSet(e.target.value)}
                    placeholder='[{"label": "A", "embedding": [0.1, 0.2]}]'
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Query Set (JSON)</Label>
                  <Textarea
                    value={querySet}
                    onChange={(e) => setQuerySet(e.target.value)}
                    placeholder='[{"embedding": [0.1, 0.2]}]'
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runMetaLearning} disabled={loading}>
                    Learn
                  </Button>
                  <Button onClick={adaptModel} disabled={loading} variant="secondary">
                    Adapt
                  </Button>
                  <Button onClick={evaluateMeta} disabled={loading} variant="outline">
                    Evaluate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meta-Learning Results</CardTitle>
                <CardDescription>Results from meta-learning</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {metaResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(metaResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run meta-learning to see results
                    </p>
                  )}
                  {metaAccuracy !== null && (
                    <div className="mt-4 p-4 bg-green-50 rounded">
                      <p className="font-bold">Accuracy: {(metaAccuracy * 100).toFixed(1)}%</p>
                    </div>
                  )}
                </ScrollArea>
                <Button onClick={getMetaSummary} variant="ghost" className="mt-4">
                  Get Summary
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Continuous Learning Tab */}
        <TabsContent value="continuous">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Continuous Learning</CardTitle>
                <CardDescription>
                  Online learning with experience replay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>New Entities (JSON)</Label>
                  <Textarea
                    value={newEntities}
                    onChange={(e) => setNewEntities(e.target.value)}
                    placeholder='[{"id": "e1", "embedding": [0.1, 0.2]}]'
                    rows={3}
                  />
                </div>
                <div>
                  <Label>New Relations (JSON)</Label>
                  <Textarea
                    value={newRelations}
                    onChange={(e) => setNewRelations(e.target.value)}
                    placeholder='[{"id": "r1", "source": "e1", "target": "e2"}]'
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Online LR</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={onlineLr}
                    onChange={(e) => setOnlineLr(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Replay Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={replayRatio}
                    onChange={(e) => setReplayRatio(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runContinuousUpdate} disabled={loading}>
                    Update
                  </Button>
                  <Button onClick={runReplay} disabled={loading} variant="secondary">
                    Replay
                  </Button>
                  <Button onClick={runOnlineAdaptation} disabled={loading} variant="outline">
                    Adapt
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Continuous Learning Results</CardTitle>
                <CardDescription>Results from continuous learning</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {continuousResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(continuousResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run continuous learning to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Self-Supervised Tab */}
        <TabsContent value="selfsupervised">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Self-Supervised Pretraining</CardTitle>
                <CardDescription>
                  Contrastive, masked, or autoencoder training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selfMethod}
                    onChange={(e) => setSelfMethod(e.target.value)}
                  >
                    <option value="contrastive">Contrastive</option>
                    <option value="masked">Masked Entity</option>
                    <option value="autoencoder">Autoencoder</option>
                  </select>
                </div>
                <div>
                  <Label>Epochs</Label>
                  <Input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Hidden Dim</Label>
                  <Input
                    type="number"
                    value={hiddenDim}
                    onChange={(e) => setHiddenDim(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runPretrain} disabled={loading}>
                    Pretrain
                  </Button>
                  <Button onClick={runContrastive} disabled={loading} variant="secondary">
                    Contrastive
                  </Button>
                  <Button onClick={runMasked} disabled={loading} variant="outline">
                    Masked
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Self-Supervised Results</CardTitle>
                <CardDescription>Results from self-supervised learning</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {selfSupervisedResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(selfSupervisedResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run self-supervised learning to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}