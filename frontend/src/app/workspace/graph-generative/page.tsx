"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface AutoencoderResult {
  type: string;
  latent_dim?: number;
  encoder_layers?: number;
  decoder_layers?: number;
  reconstruction?: boolean;
}

interface VariationalResult {
  type: string;
  latent_dim?: number;
  num_particles?: number;
  kl_weight?: number;
  inference?: string;
}

interface NormalizingFlowResult {
  type: string;
  num_flows?: number;
  latent_dim?: number;
  coupling_layers?: number;
}

export default function GraphGenerativePage() {
  const [activeTab, setActiveTab] = useState("autoencoder");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Autoencoder state
  const [autoType, setAutoType] = useState("gae");
  const [latentDim, setLatentDim] = useState(32);
  const [encLayers, setEncLayers] = useState(2);
  const [decLayers, setDecLayers] = useState(1);
  const [autoencoderResult, setAutoencoderResult] = useState<AutoencoderResult | null>(null);

  // Variational state
  const [varType, setVarType] = useState("vgcn");
  const [varLatent, setVarLatent] = useState(32);
  const [numParticles, setNumParticles] = useState(10);
  const [klWeight, setKlWeight] = useState(0.1);
  const [variationalResult, setVariationalResult] = useState<VariationalResult | null>(null);

  // Normalizing Flow state
  const [flowType, setFlowType] = useState("realnvp");
  const [numFlows, setNumFlows] = useState(4);
  const [flowLatent, setFlowLatent] = useState(32);
  const [couplingLayers, setCouplingLayers] = useState(2);
  const [normalizingFlowResult, setNormalizingFlowResult] = useState<NormalizingFlowResult | null>(null);

  // Run autoencoder
  const runAutoencoder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/autoencoder/encode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          auto_type: autoType,
          latent_dim: latentDim,
          encoder_layers: encLayers,
          decoder_layers: decLayers,
        }),
      });
      const data = await res.json();
      setAutoencoderResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run variational
  const runVariational = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/variational/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          var_type: varType,
          latent_dim: varLatent,
          num_particles: numParticles,
          kl_weight: klWeight,
        }),
      });
      const data = await res.json();
      setVariationalResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run normalizing flow
  const runNormalizingFlow = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/normalizingflow/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          flow_type: flowType,
          num_flows: numFlows,
          latent_dim: flowLatent,
          coupling_layers: couplingLayers,
        }),
      });
      const data = await res.json();
      setNormalizingFlowResult(data);
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
          <h1 className="text-3xl font-bold">Graph Generative</h1>
          <p className="text-muted-foreground">Autoencoders, Variational & Flows</p>
        </div>
        <Badge variant="outline">v1.72</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="autoencoder">Autoencoder</TabsTrigger>
          <TabsTrigger value="variational">Variational</TabsTrigger>
          <TabsTrigger value="normalizingflow">Normalizing Flows</TabsTrigger>
        </TabsList>

        {/* Autoencoder Tab */}
        <TabsContent value="autoencoder">
          <Card>
            <CardHeader>
              <CardTitle>Graph Autoencoder</CardTitle>
              <CardDescription>
                Encode and decode graph structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Autoencoder Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={autoType}
                    onChange={(e) => setAutoType(e.target.value)}
                  >
                    <option value="gae">GAE</option>
                    <option value="vgvae">VGAE</option>
                    <option value="argvae">ArgVAE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Latent Dimension</Label>
                  <Input
                    type="number"
                    value={latentDim}
                    onChange={(e) => setLatentDim(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Encoder Layers</Label>
                  <Input
                    type="number"
                    value={encLayers}
                    onChange={(e) => setEncLayers(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decoder Layers</Label>
                  <Input
                    type="number"
                    value={decLayers}
                    onChange={(e) => setDecLayers(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runAutoencoder} disabled={loading}>
                {loading ? "Encoding..." : "Run Autoencoder"}
              </Button>

              {autoencoderResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(autoencoderResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variational Tab */}
        <TabsContent value="variational">
          <Card>
            <CardHeader>
              <CardTitle>Graph Variational Inference</CardTitle>
              <CardDescription>
                Variational inference for graph models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Variational Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={varType}
                    onChange={(e) => setVarType(e.target.value)}
                  >
                    <option value="vgcn">V-GCN</option>
                    <option value="vgat">V-GAT</option>
                    <option value="vsage">V-SAGE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Latent Dimension</Label>
                  <Input
                    type="number"
                    value={varLatent}
                    onChange={(e) => setVarLatent(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Particles</Label>
                  <Input
                    type="number"
                    value={numParticles}
                    onChange={(e) => setNumParticles(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>KL Weight</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={klWeight}
                    onChange={(e) => setKlWeight(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runVariational} disabled={loading}>
                {loading ? "Inferring..." : "Run Variational Inference"}
              </Button>

              {variationalResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(variationalResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Normalizing Flows Tab */}
        <TabsContent value="normalizingflow">
          <Card>
            <CardHeader>
              <CardTitle>Graph Normalizing Flows</CardTitle>
              <CardDescription>
                Normalizing flows for graph distribution modeling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Flow Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={flowType}
                    onChange={(e) => setFlowType(e.target.value)}
                  >
                    <option value="realnvp">RealNVP</option>
                    <option value="nsf">NSF</option>
                    <option value="cake">CAKE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Flows</Label>
                  <Input
                    type="number"
                    value={numFlows}
                    onChange={(e) => setNumFlows(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Latent Dimension</Label>
                  <Input
                    type="number"
                    value={flowLatent}
                    onChange={(e) => setFlowLatent(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coupling Layers</Label>
                  <Input
                    type="number"
                    value={couplingLayers}
                    onChange={(e) => setCouplingLayers(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runNormalizingFlow} disabled={loading}>
                {loading ? "Flowing..." : "Run Normalizing Flows"}
              </Button>

              {normalizingFlowResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(normalizingFlowResult, null, 2)}
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