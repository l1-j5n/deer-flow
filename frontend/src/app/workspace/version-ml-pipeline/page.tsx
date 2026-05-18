"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "";

interface MLModel {
  model_id: string;
  name: string;
  model_type: string;
  status: string;
  created_at: string;
  trained_at: string | null;
  accuracy: number | null;
  f1_score: number | null;
  precision: number | null;
  recall: number | null;
  training_data_size: number;
  features: string[];
  hyperparameters: Record<string, unknown>;
}

interface TrainingJob {
  job_id: string;
  model_id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  progress: number;
  metrics: Record<string, number>;
  error: string | null;
}

interface EnrichmentSource {
  name: string;
  enabled: boolean;
  rate_limit: number;
}

interface EnrichmentTask {
  task_id: string;
  entity_ids: string[];
  source: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  enriched_count: number;
}

export default function MLPipelinePage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [enrichmentSources, setEnrichmentSources] = useState<Record<string, EnrichmentSource>>({});
  const [enrichmentTasks, setEnrichmentTasks] = useState<EnrichmentTask[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [modelMetrics, setModelMetrics] = useState<Record<string, unknown> | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [newModelType, setNewModelType] = useState("link_prediction");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadModels();
    loadEnrichmentSources();
    loadEnrichmentTasks();
  }, []);

  const loadModels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/ml/models`);
      if (res.ok) {
        const data = await res.json();
        setModels(data);
      }
    } catch (e) {
      console.error("Failed to load models:", e);
    }
  };

  const loadEnrichmentSources = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/enrich/sources`);
      if (res.ok) {
        const data = await res.json();
        setEnrichmentSources(data.sources || {});
      }
    } catch (e) {
      console.error("Failed to load enrichment sources:", e);
    }
  };

  const loadEnrichmentTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/enrich/tasks`);
      if (res.ok) {
        const data = await res.json();
        setEnrichmentTasks(data);
      }
    } catch (e) {
      console.error("Failed to load enrichment tasks:", e);
    }
  };

  const createModel = async () => {
    if (!newModelName) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/ml/models?name=${encodeURIComponent(newModelName)}&model_type=${newModelType}`, {
        method: "POST"
      });
      if (res.ok) {
        const model = await res.json();
        setModels([...models, model]);
        setNewModelName("");
      }
    } catch (e) {
      console.error("Failed to create model:", e);
    }
    setLoading(false);
  };

  const trainModel = async (modelId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/ml/models/${modelId}/train`, {
        method: "POST"
      });
      if (res.ok) {
        const job = await res.json();
        setTrainingJobs([...trainingJobs, job]);
        await loadModels();
      }
    } catch (e) {
      console.error("Failed to train model:", e);
    }
    setLoading(false);
  };

  const predictModel = async (modelId: string, entityIds: string[]) => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/ml/models/${modelId}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_ids: entityIds, return_probabilities: true })
      });
      if (res.ok) {
        const prediction = await res.json();
        alert(`Prediction completed: ${prediction.results.length} results`);
      }
    } catch (e) {
      console.error("Failed to predict:", e);
    }
  };

  const viewModelMetrics = async (modelId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/ml/models/${modelId}/metrics`);
      if (res.ok) {
        const data = await res.json();
        setModelMetrics(data);
      }
    } catch (e) {
      console.error("Failed to load model metrics:", e);
    }
  };

  const deleteModel = async (modelId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/ml/models/${modelId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setModels(models.filter(m => m.model_id !== modelId));
      }
    } catch (e) {
      console.error("Failed to delete model:", e);
    }
  };

  const toggleEnrichmentSource = async (source: string, enabled: boolean) => {
    try {
      const endpoint = enabled ? "disable" : "enable";
      const res = await fetch(`${API_BASE}/api/knowledge-graph/enrich/sources/${source}/${endpoint}`, {
        method: "POST"
      });
      if (res.ok) {
        await loadEnrichmentSources();
      }
    } catch (e) {
      console.error("Failed to toggle source:", e);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ready: "bg-green-500",
      training: "bg-yellow-500",
      failed: "bg-red-500",
      deprecated: "bg-gray-500",
      queued: "bg-blue-500",
      running: "bg-yellow-500",
      completed: "bg-green-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      link_prediction: "Link Prediction",
      node_classification: "Node Classification",
      anomaly_detection: "Anomaly Detection",
      embedding: "Embedding",
      recommendation: "Recommendation"
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ML Pipeline</h1>
          <p className="text-muted-foreground">Train and manage machine learning models on graph data</p>
        </div>
        <Badge variant="outline">v1.49.0</Badge>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="enrichment">Data Enrichment</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Model</CardTitle>
              <CardDescription>Register a new ML model for training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Model Name</Label>
                  <Input
                    placeholder="Enter model name"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Label>Model Type</Label>
                  <Select value={newModelType} onValueChange={setNewModelType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link_prediction">Link Prediction</SelectItem>
                      <SelectItem value="node_classification">Node Classification</SelectItem>
                      <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                      <SelectItem value="embedding">Embedding</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createModel} disabled={!newModelName || loading}>
                    Create Model
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(model => (
              <Card key={model.model_id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={getStatusBadge(model.status)}>{model.status}</Badge>
                  </div>
                  <CardDescription>{getTypeLabel(model.model_type)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {model.accuracy && (
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    {model.f1_score && (
                      <div className="flex justify-between">
                        <span>F1 Score:</span>
                        <span className="font-medium">{(model.f1_score * 100).toFixed(1)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Training Data:</span>
                      <span className="font-medium">{model.training_data_size} entities</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => trainModel(model.model_id)}
                        disabled={model.status === "training" || loading}
                      >
                        Train
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedModel(model);
                          viewModelMetrics(model.model_id);
                        }}
                      >
                        Metrics
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteModel(model.model_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {models.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No models yet. Create one to get started.
                </CardContent>
              </Card>
            )}
          </div>

          {modelMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Model Metrics: {selectedModel?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["accuracy", "f1_score", "precision", "recall"].map(metric => (
                    <div key={metric} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {((modelMetrics[metric as keyof typeof modelMetrics] as number) || 0) * 100}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{metric.replace("_", " ")}</div>
                    </div>
                  ))}
                </div>
                {modelMetrics.training_history && (modelMetrics.training_history as Array<{epoch: number; loss: number; val_loss: number; accuracy: number}>).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Training History</h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {(modelMetrics.training_history as Array<{epoch: number; loss: number; val_loss: number; accuracy: number}>).map((entry, i) => (
                          <div key={i} className="flex gap-4 text-sm">
                            <span className="w-12">Epoch {entry.epoch}</span>
                            <span className="w-20">Loss: {entry.loss.toFixed(3)}</span>
                            <span className="w-20">Val: {entry.val_loss.toFixed(3)}</span>
                            <span className="w-20">Acc: {(entry.accuracy * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Jobs</CardTitle>
              <CardDescription>View and monitor model training progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {trainingJobs.map(job => (
                    <div key={job.job_id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Job {job.job_id}</span>
                        <Badge className={getStatusBadge(job.status)}>{job.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Model: {job.model_id}
                      </div>
                      {job.status === "running" && (
                        <Progress value={job.progress} className="mt-2" />
                      )}
                      {job.completed_at && (
                        <div className="mt-2 text-sm">
                          Completed: {job.completed_at}
                        </div>
                      )}
                    </div>
                  ))}
                  {trainingJobs.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No training jobs yet. Train a model to see its progress here.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrichment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Data Sources</CardTitle>
              <CardDescription>Configure external data enrichment sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(enrichmentSources).map(([key, source]) => (
                  <div key={key} className="p-4 border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Rate limit: {source.rate_limit}/min
                      </div>
                    </div>
                    <Button
                      variant={source.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleEnrichmentSource(key, source.enabled)}
                    >
                      {source.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrichment Tasks</CardTitle>
              <CardDescription>View past and current data enrichment tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {enrichmentTasks.map(task => (
                    <div key={task.task_id} className="p-3 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Task {task.task_id}</span>
                        <Badge className={getStatusBadge(task.status)}>{task.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Source: {task.source} | Entities: {task.entity_ids.length}
                      </div>
                    </div>
                  ))}
                  {enrichmentTasks.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No enrichment tasks yet.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Predictions</CardTitle>
              <CardDescription>Make predictions using trained models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Model</Label>
                <Select
                  onValueChange={(value) => {
                    const model = models.find(m => m.model_id === value);
                    if (model && model.status === "ready") {
                      predictModel(model.model_id, ["e1", "e2", "e3", "e4", "e5"]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trained model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.filter(m => m.status === "ready").map(model => (
                      <SelectItem key={model.model_id} value={model.model_id}>
                        {model.name} ({getTypeLabel(model.model_type)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Select a trained model to run predictions on sample graph entities.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}