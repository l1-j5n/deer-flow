"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphQuantumPage() {
  const [activeTab, setActiveTab] = useState("embedding");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Quantum Embedding
  const [quantumType, setQuantumType] = useState("embedding");
  const [numQubits, setNumQubits] = useState(8);
  const [layers, setLayers] = useState(3);
  const [backend, setBackend] = useState("qiskit");
  const [embeddingResult, setEmbeddingResult] = useState<any>(null);

  // Quantum Circuit
  const [circuitType, setCircuitType] = useState("variational");
  const [depth, setDepth] = useState(4);
  const [gates, setGates] = useState("");
  const [optimize, setOptimize] = useState(true);
  const [circuitResult, setCircuitResult] = useState<any>(null);

  // Quantum Neural Network
  const [nnType, setNNType] = useState("qnn");
  const [numParams, setNumParams] = useState(16);
  const [activation, setActivation] = useState("relu");
  const [training, setTraining] = useState(true);
  const [nnResult, setNNResult] = useState<any>(null);

  // Summary
  const [summary, setSummary] = useState<any>(null);

  const runEmbedding = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/embedding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, quantum_type: quantumType, num_qubits: numQubits, layers, backend }),
      });
      setEmbeddingResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runAmplitude = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/amplitude`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, quantum_type: "amplitude", num_qubits: numQubits, layers, backend }),
      });
      setEmbeddingResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runBasis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/basis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, quantum_type: "basis", num_qubits: numQubits, layers, backend }),
      });
      setEmbeddingResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runCircuit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/circuit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, circuit_type: circuitType, depth, gates: gates ? gates.split(",") : [], optimize }),
      });
      setCircuitResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runCircuitVariational = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/circuit/variational`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, circuit_type: "variational", depth, gates: gates ? gates.split(",") : [], optimize }),
      });
      setCircuitResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runNN = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/nn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, nn_type: nnType, num_params: numParams, activation, training }),
      });
      setNNResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runNNTrain = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/nn/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, nn_type: nnType, num_params: numParams, activation, training: true }),
      });
      setNNResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runNNPredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/nn/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, nn_type: nnType, num_params: numParams, activation, training: false }),
      });
      setNNResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/quantum/summary`);
      setSummary(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Quantum</h1>
          <p className="text-muted-foreground">Quantum Embeddings, Circuits & Neural Networks</p>
        </div>
        <Badge variant="outline">v1.76</Badge>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      <div className="mb-4">
        <Button onClick={loadSummary} variant="outline" disabled={loading}>Load Summary</Button>
        {summary && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(summary, null, 2)}</pre></div>}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="embedding">Embedding</TabsTrigger>
          <TabsTrigger value="circuit">Circuit</TabsTrigger>
          <TabsTrigger value="nn">Neural Network</TabsTrigger>
        </TabsList>
        <TabsContent value="embedding">
          <Card>
            <CardHeader><CardTitle>Quantum Embedding</CardTitle><CardDescription>Generate quantum graph embeddings</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Backend</Label><select className="w-full h-10" value={backend} onChange={(e) => setBackend(e.target.value)}><option value="qiskit">Qiskit</option><option value="cirq">Cirq</option><option value="pennylane">PennyLane</option></select></div>
                <div><Label>Num Qubits</Label><Input type="number" value={numQubits} onChange={(e) => setNumQubits(parseInt(e.target.value))} /></div>
                <div><Label>Layers</Label><Input type="number" value={layers} onChange={(e) => setLayers(parseInt(e.target.value))} /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runEmbedding} disabled={loading}>{loading ? "Running..." : "Run Embedding"}</Button>
                <Button onClick={runAmplitude} disabled={loading} variant="secondary">Amplitude</Button>
                <Button onClick={runBasis} disabled={loading} variant="secondary">Basis</Button>
              </div>
              {embeddingResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(embeddingResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="circuit">
          <Card>
            <CardHeader><CardTitle>Quantum Circuit</CardTitle><CardDescription>Build quantum circuits</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={circuitType} onChange={(e) => setCircuitType(e.target.value)}><option value="variational">Variational</option><option value="ansatz">Ansatz</option><option value="hamiltonian">Hamiltonian</option></select></div>
                <div><Label>Depth</Label><Input type="number" value={depth} onChange={(e) => setDepth(parseInt(e.target.value))} /></div>
                <div><Label>Gates (comma-separated)</Label><Input value={gates} onChange={(e) => setGates(e.target.value)} placeholder="ry,rz,cx" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={optimize} onChange={(e) => setOptimize(e.target.checked)} />
                <Label>Optimize</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={runCircuit} disabled={loading}>{loading ? "Running..." : "Run Circuit"}</Button>
                <Button onClick={runCircuitVariational} disabled={loading} variant="secondary">Variational</Button>
              </div>
              {circuitResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(circuitResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nn">
          <Card>
            <CardHeader><CardTitle>Quantum Neural Network</CardTitle><CardDescription>Train/predict with quantum neural networks</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Graph ID</Label><Input value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
                <div><Label>Type</Label><select className="w-full h-10" value={nnType} onChange={(e) => setNNType(e.target.value)}><option value="qnn">QNN</option><option value="quantum_layer">Quantum Layer</option><option value="parametrized">Parametrized</option></select></div>
                <div><Label>Num Params</Label><Input type="number" value={numParams} onChange={(e) => setNumParams(parseInt(e.target.value))} /></div>
                <div><Label>Activation</Label><select className="w-full h-10" value={activation} onChange={(e) => setActivation(e.target.value)}><option value="relu">ReLU</option><option value="sigmoid">Sigmoid</option><option value="tanh">Tanh</option></select></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={training} onChange={(e) => setTraining(e.target.checked)} />
                <Label>Training Mode</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={runNN} disabled={loading}>Run QNN</Button>
                <Button onClick={runNNTrain} disabled={loading} variant="secondary">Train</Button>
                <Button onClick={runNNPredict} disabled={loading} variant="secondary">Predict</Button>
              </div>
              {nnResult && <div className="mt-4 p-4 bg-muted rounded-lg"><pre className="text-xs">{JSON.stringify(nnResult, null, 2)}</pre></div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}