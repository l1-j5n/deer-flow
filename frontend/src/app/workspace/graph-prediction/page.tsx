"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface ClassificationResult {
  type: string;
  num_classes?: number;
  hidden_dim?: number;
  epochs?: number;
  train_ratio?: number;
}

interface RegressionResult {
  type: string;
  target_dim?: number;
  hidden_dim?: number;
  epochs?: number;
  loss?: string;
}

interface LinkPredictionResult {
  type: string;
  num_predictions?: number;
  threshold?: number;
  scoring?: string;
}

export default function GraphPredictionPage() {
  const [activeTab, setActiveTab] = useState("classification");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Classification state
  const [classifyType, setClassifyType] = useState("gin");
  const [numClasses, setNumClasses] = useState(2);
  const [classHidden, setClassHidden] = useState(64);
  const [epochs, setEpochs] = useState(100);
  const [trainRatio, setTrainRatio] = useState(0.8);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);

  // Regression state
  const [regressType, setRegressType] = useState("gcn");
  const [targetDim, setTargetDim] = useState(1);
  const [regHidden, setRegHidden] = useState(64);
  const [regEpochs, setRegEpochs] = useState(100);
  const [loss, setLoss] = useState("mse");
  const [regressionResult, setRegressionResult] = useState<RegressionResult | null>(null);

  // Link Prediction state
  const [linkType, setLinkType] = useState("cn");
  const [numPredictions, setNumPredictions] = useState(10);
  const [threshold, setThreshold] = useState(0.5);
  const [scoring, setScoring] = useState("dot");
  const [linkPredictionResult, setLinkPredictionResult] = useState<LinkPredictionResult | null>(null);

  // Run classification
  const runClassification = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/classification/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          classify_type: classifyType,
          num_classes: numClasses,
          hidden_dim: classHidden,
          epochs: epochs,
          train_ratio: trainRatio,
        }),
      });
      const data = await res.json();
      setClassificationResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run regression
  const runRegression = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/regression/regress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          regress_type: regressType,
          target_dim: targetDim,
          hidden_dim: regHidden,
          epochs: regEpochs,
          loss: loss,
        }),
      });
      const data = await res.json();
      setRegressionResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run link prediction
  const runLinkPrediction = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/linkpredict/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          link_type: linkType,
          num_predictions: numPredictions,
          threshold: threshold,
          scoring: scoring,
        }),
      });
      const data = await res.json();
      setLinkPredictionResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Prediction</h1>
          <p className="text-muted-foreground">Classification, Regression & Link Prediction</p>
        </div>
        <Badge variant="outline">v1.70</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="regression">Regression</TabsTrigger>
          <TabsTrigger value="linkprediction">Link Prediction</TabsTrigger>
        </TabsList>

        {/* Classification Tab */}
        <TabsContent value="classification">
          <Card>
            <CardHeader>
              <CardTitle>Graph Classification</CardTitle>
              <CardDescription>
                Classify graph or nodes into categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Classification Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={classifyType}
                    onChange={(e) => setClassifyType(e.target.value)}
                  >
                    <option value="gin">GIN</option>
                    <option value="gat">GAT</option>
                    <option value="graphsage">GraphSAGE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Classes</Label>
                  <Input
                    type="number"
                    value={numClasses}
                    onChange={(e) => setNumClasses(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={classHidden}
                    onChange={(e) => setClassHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Epochs</Label>
                  <Input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Train Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={trainRatio}
                    onChange={(e) => setTrainRatio(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runClassification} disabled={loading}>
                {loading ? "Classifying..." : "Run Classification"}
              </Button>

              {classificationResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(classificationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regression Tab */}
        <TabsContent value="regression">
          <Card>
            <CardHeader>
              <CardTitle>Graph Regression</CardTitle>
              <CardDescription>
                Predict continuous values for graphs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Regression Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={regressType}
                    onChange={(e) => setRegressType(e.target.value)}
                  >
                    <option value="gcn">GCN</option>
                    <option value="gat">GAT</option>
                    <option value="sage">SAGE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Target Dimension</Label>
                  <Input
                    type="number"
                    value={targetDim}
                    onChange={(e) => setTargetDim(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={regHidden}
                    onChange={(e) => setRegHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Epochs</Label>
                  <Input
                    type="number"
                    value={regEpochs}
                    onChange={(e) => setRegEpochs(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loss Function</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={loss}
                    onChange={(e) => setLoss(e.target.value)}
                  >
                    <option value="mse">MSE</option>
                    <option value="mae">MAE</option>
                    <option value="huber">Huber</option>
                  </select>
                </div>
              </div>

              <Button onClick={runRegression} disabled={loading}>
                {loading ? "Regressing..." : "Run Regression"}
              </Button>

              {regressionResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(regressionResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Link Prediction Tab */}
        <TabsContent value="linkprediction">
          <Card>
            <CardHeader>
              <CardTitle>Graph Link Prediction</CardTitle>
              <CardDescription>
                Predict missing or future edges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prediction Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value)}
                  >
                    <option value="cn">Common Neighbors</option>
                    <option value="aa">Adamic-Adar</option>
                    <option value="pa">Preferential Attachment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Predictions</Label>
                  <Input
                    type="number"
                    value={numPredictions}
                    onChange={(e) => setNumPredictions(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scoring Function</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={scoring}
                    onChange={(e) => setScoring(e.target.value)}
                  >
                    <option value="dot">Dot Product</option>
                    <option value="cosine">Cosine</option>
                    <option value="hadamard">Hadamard</option>
                  </select>
                </div>
              </div>

              <Button onClick={runLinkPrediction} disabled={loading}>
                {loading ? "Predicting..." : "Run Link Prediction"}
              </Button>

              {linkPredictionResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(linkPredictionResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}