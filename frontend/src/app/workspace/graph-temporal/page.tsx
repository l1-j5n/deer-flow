"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface ForecastingResult {
  type: string;
  history_len?: number;
  prediction_len?: number;
  hidden_dim?: number;
  memory_dim?: number;
}

interface TemporalResult {
  type: string;
  num_layers?: number;
  hidden_dim?: number;
  bidirectional?: boolean;
  cell?: string;
}

interface DynamicsResult {
  type: string;
  time_steps?: number;
  hidden_dim?: number;
  solver?: string;
  integration?: string;
}

export default function GraphTemporalPage() {
  const [activeTab, setActiveTab] = useState("forecasting");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Forecasting state
  const [forecastType, setForecastType] = useState("tgn");
  const [historyLen, setHistoryLen] = useState(10);
  const [predictionLen, setPredictionLen] = useState(3);
  const [forecastHidden, setForecastHidden] = useState(64);
  const [forecastResult, setForecastResult] = useState<ForecastingResult | null>(null);

  // Temporal state
  const [temporalType, setTemporalType] = useState("rnn");
  const [temporalLayers, setTemporalLayers] = useState(3);
  const [temporalHidden, setTemporalHidden] = useState(64);
  const [bidirectional, setBidirectional] = useState(true);
  const [temporalResult, setTemporalResult] = useState<TemporalResult | null>(null);

  // Dynamics state
  const [dynamicsType, setDynamicsType] = useState("ode");
  const [timeSteps, setTimeSteps] = useState(10);
  const [dynamicsHidden, setDynamicsHidden] = useState(64);
  const [solver, setSolver] = useState("euler");
  const [dynamicsResult, setDynamicsResult] = useState<DynamicsResult | null>(null);

  // Run forecasting
  const runForecasting = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/forecasting/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          forecast_type: forecastType,
          history_len: historyLen,
          prediction_len: predictionLen,
          hidden_dim: forecastHidden,
        }),
      });
      const data = await res.json();
      setForecastResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run temporal modeling
  const runTemporal = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/temporal/model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          temporal_type: temporalType,
          num_layers: temporalLayers,
          hidden_dim: temporalHidden,
          bidirectional: bidirectional,
        }),
      });
      const data = await res.json();
      setTemporalResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run dynamics
  const runDynamics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/dynamics/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          dynamics_type: dynamicsType,
          time_steps: timeSteps,
          hidden_dim: dynamicsHidden,
          solver: solver,
        }),
      });
      const data = await res.json();
      setDynamicsResult(data);
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
          <h1 className="text-3xl font-bold">Graph Temporal</h1>
          <p className="text-muted-foreground">Forecasting, Temporal & Dynamics</p>
        </div>
        <Badge variant="outline">v1.65</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="temporal">Temporal</TabsTrigger>
          <TabsTrigger value="dynamics">Dynamics</TabsTrigger>
        </TabsList>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle>Graph Forecasting</CardTitle>
              <CardDescription>
                Predict future graph states and edges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Forecasting Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={forecastType}
                    onChange={(e) => setForecastType(e.target.value)}
                  >
                    <option value="tgn">TGN</option>
                    <option value="jodie">JODIE</option>
                    <option value="tgcn">TGCN</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>History Length</Label>
                  <Input
                    type="number"
                    value={historyLen}
                    onChange={(e) => setHistoryLen(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prediction Length</Label>
                  <Input
                    type="number"
                    value={predictionLen}
                    onChange={(e) => setPredictionLen(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={forecastHidden}
                    onChange={(e) => setForecastHidden(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runForecasting} disabled={loading}>
                {loading ? "Forecasting..." : "Run Forecasting"}
              </Button>

              {forecastResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(forecastResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temporal Tab */}
        <TabsContent value="temporal">
          <Card>
            <CardHeader>
              <CardTitle>Graph Temporal Modeling</CardTitle>
              <CardDescription>
                Model temporal patterns in dynamic graphs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Temporal Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={temporalType}
                    onChange={(e) => setTemporalType(e.target.value)}
                  >
                    <option value="rnn">RNN</option>
                    <option value="lstm">LSTM</option>
                    <option value="gru">GRU</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Layers</Label>
                  <Input
                    type="number"
                    value={temporalLayers}
                    onChange={(e) => setTemporalLayers(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={temporalHidden}
                    onChange={(e) => setTemporalHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="bidirectional"
                    checked={bidirectional}
                    onChange={(e) => setBidirectional(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="bidirectional">Bidirectional</Label>
                </div>
              </div>

              <Button onClick={runTemporal} disabled={loading}>
                {loading ? "Processing..." : "Run Temporal Model"}
              </Button>

              {temporalResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(temporalResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dynamics Tab */}
        <TabsContent value="dynamics">
          <Card>
            <CardHeader>
              <CardTitle>Graph Dynamics</CardTitle>
              <CardDescription>
                Simulate graph evolution with differential equations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Dynamics Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={dynamicsType}
                    onChange={(e) => setDynamicsType(e.target.value)}
                  >
                    <option value="ode">ODE</option>
                    <option value="pde">PDE</option>
                    <option value="sde">SDE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Time Steps</Label>
                  <Input
                    type="number"
                    value={timeSteps}
                    onChange={(e) => setTimeSteps(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Solver</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={solver}
                    onChange={(e) => setSolver(e.target.value)}
                  >
                    <option value="euler">Euler</option>
                    <option value="rk4">RK4</option>
                    <option value="adjoint">Adjoint</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={dynamicsHidden}
                    onChange={(e) => setDynamicsHidden(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runDynamics} disabled={loading}>
                {loading ? "Simulating..." : "Run Dynamics"}
              </Button>

              {dynamicsResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(dynamicsResult, null, 2)}
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