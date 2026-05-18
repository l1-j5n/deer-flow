"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const PRIVACY_MECHANISMS = [
  { value: "edge_dp", label: "Edge-DP", desc: "Protect edge privacy", color: "bg-blue-900 text-blue-200" },
  { value: "node_dp", label: "Node-DP", desc: "Protect node privacy", color: "bg-green-900 text-green-200" },
  { value: "ldp", label: "Local DP", desc: "User-side perturbation", color: "bg-purple-900 text-purple-200" },
  { value: "gap", label: "GAP", desc: "Graph-aware privacy", color: "bg-orange-900 text-orange-200" },
  { value: "dp_sgd", label: "DP-SGD", desc: "Gradient perturbation", color: "bg-pink-900 text-pink-200" },
  { value: "federated", label: "Federated", desc: "Distributed training", color: "bg-cyan-900 text-cyan-200" },
];

const ATTACK_TYPES = [
  { value: "membership_inference", label: "Membership Inference" },
  { value: "attribute_inference", label: "Attribute Inference" },
  { value: "link_prediction", label: "Link Prediction Attack" },
  { value: "model_inversion", label: "Model Inversion" },
  { value: "property_inference", label: "Property Inference" },
];

export default function GraphPrivacyPage() {
  const [activeTab, setActiveTab] = useState("mechanisms");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Shared params
  const [epsilon, setEpsilon] = useState(1.0);
  const [delta, setDelta] = useState(0.00001);

  // Edge-DP params
  const [edgeNumNodes, setEdgeNumNodes] = useState(100);
  const [edgeNumEdges, setEdgeNumEdges] = useState(500);
  const [edgeMechanism, setEdgeMechanism] = useState("laplace");

  // Node-DP params
  const [nodeNumNodes, setNodeNumNodes] = useState(100);
  const [nodeMaxDegree, setNodeMaxDegree] = useState(20);
  const [nodeMechanism, setNodeMechanism] = useState("gaussian");

  // LDP params
  const [ldpNumUsers, setLdpNumUsers] = useState(100);
  const [ldpNumFeatures, setLdpNumFeatures] = useState(10);
  const [ldpMechanism, setLdpMechanism] = useState("laplace");

  // GAP params
  const [gapHiddenDim, setGapHiddenDim] = useState(64);
  const [gapNumLayers, setGapNumLayers] = useState(2);
  const [gapNoiseMult, setGapNoiseMult] = useState(1.1);

  // DP-SGD params
  const [sgdEpochs, setSgdEpochs] = useState(50);
  const [sgdBatchSize, setSgdBatchSize] = useState(32);
  const [sgdNumNodes, setSgdNumNodes] = useState(1000);
  const [sgdLR, setSgdLR] = useState(0.01);
  const [sgdMaxGradNorm, setSgdMaxGradNorm] = useState(1.0);
  const [sgdNoiseMult, setSgdNoiseMult] = useState(1.1);

  // Federated params
  const [fedClients, setFedClients] = useState(10);
  const [fedRounds, setFedRounds] = useState(20);
  const [fedLocalEps, setFedLocalEps] = useState(2.0);
  const [fedLocalEpochs, setFedLocalEpochs] = useState(3);
  const [fedAggregation, setFedAggregation] = useState("fedavg");

  // Budget params
  const [budgetTotal, setBudgetTotal] = useState(10.0);

  // Attack params
  const [attackType, setAttackType] = useState("membership_inference");
  const [attackSamples, setAttackSamples] = useState(200);
  const [attackDefenseEps, setAttackDefenseEps] = useState(1.0);

  // Tradeoff params
  const [tradeoffMechanism, setTradeoffMechanism] = useState("gaussian");

  const callAPI = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdgeDP = () => callAPI("/privacy/edge-dp", {
    graph_id: graphId, epsilon, num_nodes: edgeNumNodes, mechanism: edgeMechanism, num_edges: edgeNumEdges
  });

  const handleNodeDP = () => callAPI("/privacy/node-dp", {
    graph_id: graphId, epsilon, delta, num_nodes: nodeNumNodes, mechanism: nodeMechanism, max_degree: nodeMaxDegree
  });

  const handleLDP = () => callAPI("/privacy/ldp", {
    graph_id: graphId, epsilon, num_users: ldpNumUsers, num_features: ldpNumFeatures, mechanism: ldpMechanism
  });

  const handleGAP = () => callAPI("/privacy/gap", {
    graph_id: graphId, epsilon, num_nodes: nodeNumNodes, hidden_dim: gapHiddenDim,
    num_layers: gapNumLayers, noise_multiplier: gapNoiseMult
  });

  const handleDPSGD = () => callAPI("/privacy/dp-sgd", {
    graph_id: graphId, epsilon, delta, num_epochs: sgdEpochs, batch_size: sgdBatchSize,
    num_nodes: sgdNumNodes, learning_rate: sgdLR, max_grad_norm: sgdMaxGradNorm, noise_multiplier: sgdNoiseMult
  });

  const handleFederated = () => callAPI("/privacy/federated", {
    graph_id: graphId, num_clients: fedClients, num_rounds: fedRounds,
    local_epsilon: fedLocalEps, local_epochs: fedLocalEpochs, aggregation: fedAggregation
  });

  const handleBudget = () => callAPI("/privacy/budget", {
    graph_id: graphId, total_budget: budgetTotal,
    operations: [
      {"name": "degree_query", "epsilon": 0.5},
      {"name": "subgraph_query", "epsilon": 1.0},
      {"name": "model_training", "epsilon": 3.0},
      {"name": "embedding_export", "epsilon": 2.0},
    ]
  });

  const handleAttack = () => callAPI("/privacy/attack", {
    graph_id: graphId, attack_type: attackType, num_samples: attackSamples, defense_epsilon: attackDefenseEps
  });

  const handleTradeoff = () => callAPI("/privacy/utility-tradeoff", {
    graph_id: graphId, epsilon_range: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0], mechanism: tradeoffMechanism
  });

  const renderResultPanel = () => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Privacy Result</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Differential Privacy</h1>
          <p className="text-muted-foreground text-sm">
            Privacy-preserving graph machine learning with differential privacy guarantees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
          <Label className="text-xs ml-2">ε</Label>
          <Input type="number" value={epsilon} onChange={e => setEpsilon(+e.target.value)} className="w-20 h-8 text-xs" step={0.1} min={0.01} max={100} />
          <Label className="text-xs ml-2">δ</Label>
          <Input type="number" value={delta} onChange={e => setDelta(+e.target.value)} className="w-24 h-8 text-xs" step={0.00001} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="mechanisms">DP Mechanisms</TabsTrigger>
          <TabsTrigger value="training">Private Training</TabsTrigger>
          <TabsTrigger value="budget">Budget & Attack</TabsTrigger>
          <TabsTrigger value="tradeoff">Utility Tradeoff</TabsTrigger>
        </TabsList>

        {/* Tab 1: DP Mechanisms */}
        <TabsContent value="mechanisms" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Edge-DP */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Edge Differential Privacy</CardTitle>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">Edge-DP</Badge>
                </div>
                <CardDescription className="text-xs">
                  Perturb adjacency matrix to hide individual edge presence/absence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Nodes</Label>
                    <Input type="number" value={edgeNumNodes} onChange={e => setEdgeNumNodes(+e.target.value)} className="h-8 text-xs" min={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Edges</Label>
                    <Input type="number" value={edgeNumEdges} onChange={e => setEdgeNumEdges(+e.target.value)} className="h-8 text-xs" min={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Mechanism</Label>
                    <select value={edgeMechanism} onChange={e => setEdgeMechanism(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="laplace">Laplace</option>
                      <option value="gaussian">Gaussian</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleEdgeDP} disabled={loading} size="sm" className="w-full">Apply Edge-DP</Button>
              </CardContent>
            </Card>

            {/* Node-DP */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Node Differential Privacy</CardTitle>
                  <Badge className="bg-green-900 text-green-200 text-xs">Node-DP</Badge>
                </div>
                <CardDescription className="text-xs">
                  Protect presence/absence of entire nodes and their connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Nodes</Label>
                    <Input type="number" value={nodeNumNodes} onChange={e => setNodeNumNodes(+e.target.value)} className="h-8 text-xs" min={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Max Degree</Label>
                    <Input type="number" value={nodeMaxDegree} onChange={e => setNodeMaxDegree(+e.target.value)} className="h-8 text-xs" min={1} />
                  </div>
                  <div>
                    <Label className="text-xs">Mechanism</Label>
                    <select value={nodeMechanism} onChange={e => setNodeMechanism(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="laplace">Laplace</option>
                      <option value="gaussian">Gaussian</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleNodeDP} disabled={loading} size="sm" className="w-full">Apply Node-DP</Button>
              </CardContent>
            </Card>

            {/* Local DP */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Local Differential Privacy</CardTitle>
                  <Badge className="bg-purple-900 text-purple-200 text-xs">LDP</Badge>
                </div>
                <CardDescription className="text-xs">
                  Each user perturbs own data before sharing — no trusted center needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Users</Label>
                    <Input type="number" value={ldpNumUsers} onChange={e => setLdpNumUsers(+e.target.value)} className="h-8 text-xs" min={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Features</Label>
                    <Input type="number" value={ldpNumFeatures} onChange={e => setLdpNumFeatures(+e.target.value)} className="h-8 text-xs" min={1} />
                  </div>
                  <div>
                    <Label className="text-xs">Mechanism</Label>
                    <select value={ldpMechanism} onChange={e => setLdpMechanism(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="laplace">Laplace</option>
                      <option value="gaussian">Gaussian</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleLDP} disabled={loading} size="sm" className="w-full">Apply Local-DP</Button>
              </CardContent>
            </Card>

            {/* GAP */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Graph-Aware Privacy</CardTitle>
                  <Badge className="bg-orange-900 text-orange-200 text-xs">GAP</Badge>
                </div>
                <CardDescription className="text-xs">
                  Topology-aware noise injection optimized for graph neural networks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Hidden Dim</Label>
                    <Input type="number" value={gapHiddenDim} onChange={e => setGapHiddenDim(+e.target.value)} className="h-8 text-xs" min={8} />
                  </div>
                  <div>
                    <Label className="text-xs">GNN Layers</Label>
                    <Input type="number" value={gapNumLayers} onChange={e => setGapNumLayers(+e.target.value)} className="h-8 text-xs" min={1} max={6} />
                  </div>
                  <div>
                    <Label className="text-xs">Noise Mult</Label>
                    <Input type="number" value={gapNoiseMult} onChange={e => setGapNoiseMult(+e.target.value)} className="h-8 text-xs" step={0.1} min={0.5} />
                  </div>
                </div>
                <Button onClick={handleGAP} disabled={loading} size="sm" className="w-full">Apply GAP</Button>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 2: Private Training */}
        <TabsContent value="training" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DP-SGD */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Differentially Private SGD</CardTitle>
                  <Badge className="bg-pink-900 text-pink-200 text-xs">DP-SGD</Badge>
                </div>
                <CardDescription className="text-xs">
                  Gradient clipping + noise injection for private GNN training with moments accountant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Epochs</Label>
                    <Input type="number" value={sgdEpochs} onChange={e => setSgdEpochs(+e.target.value)} className="h-8 text-xs" min={10} max={500} />
                  </div>
                  <div>
                    <Label className="text-xs">Batch Size</Label>
                    <Input type="number" value={sgdBatchSize} onChange={e => setSgdBatchSize(+e.target.value)} className="h-8 text-xs" min={8} />
                  </div>
                  <div>
                    <Label className="text-xs">Nodes</Label>
                    <Input type="number" value={sgdNumNodes} onChange={e => setSgdNumNodes(+e.target.value)} className="h-8 text-xs" min={100} />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">LR</Label>
                    <Input type="number" value={sgdLR} onChange={e => setSgdLR(+e.target.value)} className="h-8 text-xs" step={0.001} />
                  </div>
                  <div>
                    <Label className="text-xs">Max Grad Norm</Label>
                    <Input type="number" value={sgdMaxGradNorm} onChange={e => setSgdMaxGradNorm(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                  <div>
                    <Label className="text-xs">Noise Mult</Label>
                    <Input type="number" value={sgdNoiseMult} onChange={e => setSgdNoiseMult(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleDPSGD} disabled={loading} size="sm" className="w-full">Train DP-SGD</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Federated */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Federated Graph Learning</CardTitle>
                  <Badge className="bg-cyan-900 text-cyan-200 text-xs">Federated</Badge>
                </div>
                <CardDescription className="text-xs">
                  Distributed training across clients with local DP and secure aggregation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Clients</Label>
                    <Input type="number" value={fedClients} onChange={e => setFedClients(+e.target.value)} className="h-8 text-xs" min={2} max={100} />
                  </div>
                  <div>
                    <Label className="text-xs">Rounds</Label>
                    <Input type="number" value={fedRounds} onChange={e => setFedRounds(+e.target.value)} className="h-8 text-xs" min={5} max={200} />
                  </div>
                  <div>
                    <Label className="text-xs">Local ε</Label>
                    <Input type="number" value={fedLocalEps} onChange={e => setFedLocalEps(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Local Epochs</Label>
                    <Input type="number" value={fedLocalEpochs} onChange={e => setFedLocalEpochs(+e.target.value)} className="h-8 text-xs" min={1} max={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Aggregation</Label>
                    <select value={fedAggregation} onChange={e => setFedAggregation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="fedavg">FedAvg</option>
                      <option value="fedprox">FedProx</option>
                      <option value="fednova">FedNova</option>
                      <option value="scaffold">SCAFFOLD</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleFederated} disabled={loading} size="sm" className="w-full">Train Federated</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 3: Budget & Attack */}
        <TabsContent value="budget" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget Management */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Privacy Budget Management</CardTitle>
                  <Badge className="bg-amber-900 text-amber-200 text-xs">Budget</Badge>
                </div>
                <CardDescription className="text-xs">
                  Track and allocate privacy budget across operations — prevent budget exhaustion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Total Privacy Budget (ε)</Label>
                  <Input type="number" value={budgetTotal} onChange={e => setBudgetTotal(+e.target.value)} className="h-8 text-xs" step={0.5} min={0.5} />
                </div>
                <div className="text-xs text-muted-foreground">
                  Operations: degree_query(0.5ε), subgraph_query(1.0ε), model_training(3.0ε), embedding_export(2.0ε)
                </div>
                <Button onClick={handleBudget} disabled={loading} size="sm" className="w-full">Compute Budget Allocation</Button>
              </CardContent>
            </Card>

            {/* Attack Simulation */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Privacy Attack Simulation</CardTitle>
                  <Badge className="bg-red-900 text-red-200 text-xs">Attack</Badge>
                </div>
                <CardDescription className="text-xs">
                  Simulate membership/attribute/link attacks with and without DP defense
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Attack Type</Label>
                  <select value={attackType} onChange={e => setAttackType(e.target.value)} className="w-full h-8 text-xs border rounded px-2 mt-1">
                    {ATTACK_TYPES.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Samples</Label>
                    <Input type="number" value={attackSamples} onChange={e => setAttackSamples(+e.target.value)} className="h-8 text-xs" min={50} max={10000} />
                  </div>
                  <div>
                    <Label className="text-xs">Defense ε</Label>
                    <Input type="number" value={attackDefenseEps} onChange={e => setAttackDefenseEps(+e.target.value)} className="h-8 text-xs" step={0.1} min={0.1} />
                  </div>
                </div>
                <Button onClick={handleAttack} disabled={loading} size="sm" className="w-full">Run Attack Simulation</Button>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 4: Utility Tradeoff */}
        <TabsContent value="tradeoff" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Privacy-Utility Tradeoff Analysis</CardTitle>
                <Badge className="bg-emerald-900 text-emerald-200 text-xs">Tradeoff</Badge>
              </div>
              <CardDescription className="text-xs">
                Analyze accuracy vs privacy across ε values — find optimal balance point
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Noise Mechanism</Label>
                  <select value={tradeoffMechanism} onChange={e => setTradeoffMechanism(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    <option value="gaussian">Gaussian</option>
                    <option value="laplace">Laplace</option>
                    <option value="analytic_gaussian">Analytic Gaussian</option>
                    <option value="staircase">Staircase</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Label className="text-xs text-muted-foreground">
                    ε range: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
                  </Label>
                </div>
              </div>
              <Button onClick={handleTradeoff} disabled={loading} size="sm" className="w-full">
                Analyze Privacy-Utility Tradeoff
              </Button>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Computing privacy guarantees...</div>
      )}
      {error && (
        <Card className="border-red-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
