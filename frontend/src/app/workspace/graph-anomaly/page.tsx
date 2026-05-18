"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const ANOMALY_METHODS = [
  { value: "dominant", label: "DOMINANT", desc: "Dual autoencoder + attention", color: "bg-blue-900 text-blue-200" },
  { value: "done", label: "DONE", desc: "Proximity + deviation", color: "bg-green-900 text-green-200" },
  { value: "anomaly_dae", label: "AnomalyDAE", desc: "Dual autoencoder", color: "bg-purple-900 text-purple-200" },
  { value: "gaan", label: "GAAN", desc: "Generative adversarial", color: "bg-orange-900 text-orange-200" },
  { value: "guide", label: "GUIDE", desc: "Graph U-Net hierarchical", color: "bg-pink-900 text-pink-200" },
  { value: "conad", label: "CONAD", desc: "Community-aware", color: "bg-cyan-900 text-cyan-200" },
];

export default function GraphAnomalyPage() {
  const [activeTab, setActiveTab] = useState("node");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Common params
  const [numNodes, setNumNodes] = useState(100);
  const [numAnomalies, setNumAnomalies] = useState(5);

  // DOMINANT params
  const [domLatentDim, setDomLatentDim] = useState(32);
  const [domAttentionHeads, setDomAttentionHeads] = useState(4);
  const [domContamination, setDomContamination] = useState(0.05);

  // DONE params
  const [doneEmbedDim, setDoneEmbedDim] = useState(64);
  const [doneProxWeight, setDoneProxWeight] = useState(0.5);

  // AnomalyDAE params
  const [daeStructDim, setDaeStructDim] = useState(32);
  const [daeAttrDim, setDaeAttrDim] = useState(16);
  const [daeThreshold, setDaeThreshold] = useState(95);

  // GAAN params
  const [gaanLatentDim, setGaanLatentDim] = useState(32);
  const [gaanDiscSteps, setGaanDiscSteps] = useState(5);

  // GUIDE params
  const [guidePoolLayers, setGuidePoolLayers] = useState(3);
  const [guideHiddenDim, setGuideHiddenDim] = useState(64);
  const [guidePoolRatio, setGuidePoolRatio] = useState(0.5);

  // CONAD params
  const [conadCommunities, setConadCommunities] = useState(5);
  const [conadCommWeight, setConadCommWeight] = useState(0.3);

  // Edge detection params
  const [numEdges, setNumEdges] = useState(200);
  const [numAnomalyEdges, setNumAnomalyEdges] = useState(10);
  const [edgeFeatureDim, setEdgeFeatureDim] = useState(16);

  // Subgraph params
  const [numSubgraphs, setNumSubgraphs] = useState(50);
  const [numAnomalySubgraphs, setNumAnomalySubgraphs] = useState(3);
  const [maxSubgraphSize, setMaxSubgraphSize] = useState(15);

  // Explanation params
  const [explainNodeId, setExplainNodeId] = useState(0);
  const [explainMethod, setExplainMethod] = useState("dominant");
  const [explainFeatures, setExplainFeatures] = useState(10);
  const [explainNeighbors, setExplainNeighbors] = useState(5);

  // Benchmark params
  const [benchTrials, setBenchTrials] = useState(5);

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

  const handleDOMINANT = () => callAPI("/anomaly/dominant", {
    graph_id: graphId, num_nodes: numNodes, latent_dim: domLatentDim,
    num_anomalies: numAnomalies, attention_heads: domAttentionHeads, contamination: domContamination
  });

  const handleDONE = () => callAPI("/anomaly/done", {
    graph_id: graphId, num_nodes: numNodes, embedding_dim: doneEmbedDim,
    num_anomalies: numAnomalies, proximity_weight: doneProxWeight
  });

  const handleAnomalyDAE = () => callAPI("/anomaly/anomaly-dae", {
    graph_id: graphId, num_nodes: numNodes, struct_latent_dim: daeStructDim,
    attr_latent_dim: daeAttrDim, num_anomalies: numAnomalies, threshold_percentile: daeThreshold
  });

  const handleGAAN = () => callAPI("/anomaly/gaan", {
    graph_id: graphId, num_nodes: numNodes, latent_dim: gaanLatentDim,
    num_anomalies: numAnomalies, discriminator_steps: gaanDiscSteps
  });

  const handleGUIDE = () => callAPI("/anomaly/guide", {
    graph_id: graphId, num_nodes: numNodes, num_pool_layers: guidePoolLayers,
    hidden_dim: guideHiddenDim, num_anomalies: numAnomalies, pooling_ratio: guidePoolRatio
  });

  const handleCONAD = () => callAPI("/anomaly/conad", {
    graph_id: graphId, num_nodes: numNodes, num_communities: conadCommunities,
    num_anomalies: numAnomalies, community_weight: conadCommWeight
  });

  const handleExplain = () => callAPI("/anomaly/explain", {
    graph_id: graphId, node_id: explainNodeId, method: explainMethod,
    num_features: explainFeatures, num_neighbors: explainNeighbors
  });

  const handleEdgeDetect = () => callAPI("/anomaly/edge-detect", {
    graph_id: graphId, num_edges: numEdges, num_anomaly_edges: numAnomalyEdges, feature_dim: edgeFeatureDim
  });

  const handleSubgraphDetect = () => callAPI("/anomaly/subgraph-detect", {
    graph_id: graphId, num_subgraphs: numSubgraphs, num_anomaly_subgraphs: numAnomalySubgraphs, max_subgraph_size: maxSubgraphSize
  });

  const handleBenchmark = () => callAPI("/anomaly/benchmark", {
    graph_id: graphId, num_trials: benchTrials, num_nodes: numNodes, num_anomalies: numAnomalies
  });

  const renderResultPanel = () => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detection Result</CardTitle>
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
          <h1 className="text-2xl font-bold">Graph Anomaly Detection</h1>
          <p className="text-muted-foreground text-sm">
            Detect anomalous nodes, edges, and subgraphs in graph data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
          <Label className="text-xs ml-2">Nodes</Label>
          <Input type="number" value={numNodes} onChange={e => setNumNodes(+e.target.value)} className="w-20 h-8 text-xs" min={10} max={10000} />
          <Label className="text-xs ml-2">Anomalies</Label>
          <Input type="number" value={numAnomalies} onChange={e => setNumAnomalies(+e.target.value)} className="w-20 h-8 text-xs" min={1} max={100} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="node">Node Detection</TabsTrigger>
          <TabsTrigger value="edge">Edge & Subgraph</TabsTrigger>
          <TabsTrigger value="explain">Explanation</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        {/* Tab 1: Node-level anomaly detection */}
        <TabsContent value="node" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DOMINANT */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">DOMINANT</CardTitle>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">Attention AE</Badge>
                </div>
                <CardDescription className="text-xs">
                  Dual autoencoder with attention for attributed network anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Latent Dim</Label>
                    <Input type="number" value={domLatentDim} onChange={e => setDomLatentDim(+e.target.value)} className="h-8 text-xs" min={8} max={128} />
                  </div>
                  <div>
                    <Label className="text-xs">Attention Heads</Label>
                    <Input type="number" value={domAttentionHeads} onChange={e => setDomAttentionHeads(+e.target.value)} className="h-8 text-xs" min={1} max={8} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Contamination</Label>
                  <Input type="number" value={domContamination} onChange={e => setDomContamination(+e.target.value)} className="h-8 text-xs" step={0.01} min={0.01} max={0.5} />
                </div>
                <Button onClick={handleDOMINANT} disabled={loading} size="sm" className="w-full">Run DOMINANT</Button>
              </CardContent>
            </Card>

            {/* DONE */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">DONE</CardTitle>
                  <Badge className="bg-green-900 text-green-200 text-xs">Proximity</Badge>
                </div>
                <CardDescription className="text-xs">
                  Deep outlier node detection via proximity and deviation analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Embedding Dim</Label>
                    <Input type="number" value={doneEmbedDim} onChange={e => setDoneEmbedDim(+e.target.value)} className="h-8 text-xs" min={16} max={256} />
                  </div>
                  <div>
                    <Label className="text-xs">Proximity Weight</Label>
                    <Input type="number" value={doneProxWeight} onChange={e => setDoneProxWeight(+e.target.value)} className="h-8 text-xs" step={0.1} min={0} max={1} />
                  </div>
                </div>
                <Button onClick={handleDONE} disabled={loading} size="sm" className="w-full">Run DONE</Button>
              </CardContent>
            </Card>

            {/* AnomalyDAE */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">AnomalyDAE</CardTitle>
                  <Badge className="bg-purple-900 text-purple-200 text-xs">Dual AE</Badge>
                </div>
                <CardDescription className="text-xs">
                  Dual autoencoder for structure and attribute reconstruction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Struct Dim</Label>
                    <Input type="number" value={daeStructDim} onChange={e => setDaeStructDim(+e.target.value)} className="h-8 text-xs" min={8} max={128} />
                  </div>
                  <div>
                    <Label className="text-xs">Attr Dim</Label>
                    <Input type="number" value={daeAttrDim} onChange={e => setDaeAttrDim(+e.target.value)} className="h-8 text-xs" min={8} max={64} />
                  </div>
                  <div>
                    <Label className="text-xs">Threshold %</Label>
                    <Input type="number" value={daeThreshold} onChange={e => setDaeThreshold(+e.target.value)} className="h-8 text-xs" min={80} max={99} />
                  </div>
                </div>
                <Button onClick={handleAnomalyDAE} disabled={loading} size="sm" className="w-full">Run AnomalyDAE</Button>
              </CardContent>
            </Card>

            {/* GAAN */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">GAAN</CardTitle>
                  <Badge className="bg-orange-900 text-orange-200 text-xs">Adversarial</Badge>
                </div>
                <CardDescription className="text-xs">
                  Generative adversarial attributed network for anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Latent Dim</Label>
                    <Input type="number" value={gaanLatentDim} onChange={e => setGaanLatentDim(+e.target.value)} className="h-8 text-xs" min={8} max={128} />
                  </div>
                  <div>
                    <Label className="text-xs">Discriminator Steps</Label>
                    <Input type="number" value={gaanDiscSteps} onChange={e => setGaanDiscSteps(+e.target.value)} className="h-8 text-xs" min={1} max={10} />
                  </div>
                </div>
                <Button onClick={handleGAAN} disabled={loading} size="sm" className="w-full">Run GAAN</Button>
              </CardContent>
            </Card>

            {/* GUIDE */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">GUIDE</CardTitle>
                  <Badge className="bg-pink-900 text-pink-200 text-xs">Hierarchical</Badge>
                </div>
                <CardDescription className="text-xs">
                  Graph U-Net based hierarchical pooling for anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Pool Layers</Label>
                    <Input type="number" value={guidePoolLayers} onChange={e => setGuidePoolLayers(+e.target.value)} className="h-8 text-xs" min={1} max={6} />
                  </div>
                  <div>
                    <Label className="text-xs">Hidden Dim</Label>
                    <Input type="number" value={guideHiddenDim} onChange={e => setGuideHiddenDim(+e.target.value)} className="h-8 text-xs" min={16} max={256} />
                  </div>
                  <div>
                    <Label className="text-xs">Pool Ratio</Label>
                    <Input type="number" value={guidePoolRatio} onChange={e => setGuidePoolRatio(+e.target.value)} className="h-8 text-xs" step={0.1} min={0.1} max={0.9} />
                  </div>
                </div>
                <Button onClick={handleGUIDE} disabled={loading} size="sm" className="w-full">Run GUIDE</Button>
              </CardContent>
            </Card>

            {/* CONAD */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">CONAD</CardTitle>
                  <Badge className="bg-cyan-900 text-cyan-200 text-xs">Community</Badge>
                </div>
                <CardDescription className="text-xs">
                  Community-aware anomaly detection leveraging graph community structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Communities</Label>
                    <Input type="number" value={conadCommunities} onChange={e => setConadCommunities(+e.target.value)} className="h-8 text-xs" min={2} max={20} />
                  </div>
                  <div>
                    <Label className="text-xs">Community Weight</Label>
                    <Input type="number" value={conadCommWeight} onChange={e => setConadCommWeight(+e.target.value)} className="h-8 text-xs" step={0.05} min={0} max={1} />
                  </div>
                </div>
                <Button onClick={handleCONAD} disabled={loading} size="sm" className="w-full">Run CONAD</Button>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 2: Edge & Subgraph detection */}
        <TabsContent value="edge" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Edge Detection */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Edge Anomaly Detection</CardTitle>
                  <Badge className="bg-amber-900 text-amber-200 text-xs">Edge-Level</Badge>
                </div>
                <CardDescription className="text-xs">
                  Detect anomalous connections via weight deviation, structural surprise, and feature divergence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Num Edges</Label>
                    <Input type="number" value={numEdges} onChange={e => setNumEdges(+e.target.value)} className="h-8 text-xs" min={10} max={10000} />
                  </div>
                  <div>
                    <Label className="text-xs">Anomaly Edges</Label>
                    <Input type="number" value={numAnomalyEdges} onChange={e => setNumAnomalyEdges(+e.target.value)} className="h-8 text-xs" min={1} max={100} />
                  </div>
                  <div>
                    <Label className="text-xs">Feature Dim</Label>
                    <Input type="number" value={edgeFeatureDim} onChange={e => setEdgeFeatureDim(+e.target.value)} className="h-8 text-xs" min={4} max={64} />
                  </div>
                </div>
                <Button onClick={handleEdgeDetect} disabled={loading} size="sm" className="w-full">Run Edge Detection</Button>
              </CardContent>
            </Card>

            {/* Subgraph Detection */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Subgraph Anomaly Detection</CardTitle>
                  <Badge className="bg-teal-900 text-teal-200 text-xs">Subgraph-Level</Badge>
                </div>
                <CardDescription className="text-xs">
                  Detect anomalous graph substructures via density, pattern, and cohesion analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Subgraphs</Label>
                    <Input type="number" value={numSubgraphs} onChange={e => setNumSubgraphs(+e.target.value)} className="h-8 text-xs" min={5} max={500} />
                  </div>
                  <div>
                    <Label className="text-xs">Anomaly SGs</Label>
                    <Input type="number" value={numAnomalySubgraphs} onChange={e => setNumAnomalySubgraphs(+e.target.value)} className="h-8 text-xs" min={1} max={20} />
                  </div>
                  <div>
                    <Label className="text-xs">Max SG Size</Label>
                    <Input type="number" value={maxSubgraphSize} onChange={e => setMaxSubgraphSize(+e.target.value)} className="h-8 text-xs" min={3} max={50} />
                  </div>
                </div>
                <Button onClick={handleSubgraphDetect} disabled={loading} size="sm" className="w-full">Run Subgraph Detection</Button>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 3: Explanation */}
        <TabsContent value="explain" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Anomaly Explanation</CardTitle>
                  <Badge className="bg-indigo-900 text-indigo-200 text-xs">XAI</Badge>
                </div>
                <CardDescription className="text-xs">
                  Explain why a node was flagged as anomalous — feature attribution, neighbor context, subgraph pattern
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Node ID</Label>
                    <Input type="number" value={explainNodeId} onChange={e => setExplainNodeId(+e.target.value)} className="h-8 text-xs" min={0} />
                  </div>
                  <div>
                    <Label className="text-xs">Detection Method</Label>
                    <select value={explainMethod} onChange={e => setExplainMethod(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {ANOMALY_METHODS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Features</Label>
                    <Input type="number" value={explainFeatures} onChange={e => setExplainFeatures(+e.target.value)} className="h-8 text-xs" min={5} max={50} />
                  </div>
                  <div>
                    <Label className="text-xs">Num Neighbors</Label>
                    <Input type="number" value={explainNeighbors} onChange={e => setExplainNeighbors(+e.target.value)} className="h-8 text-xs" min={1} max={20} />
                  </div>
                </div>
                <Button onClick={handleExplain} disabled={loading} size="sm" className="w-full">Explain Anomaly</Button>
              </CardContent>
            </Card>

            {/* Info card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Explanation Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">Feature Attribution</Badge>
                    <span>Which features contribute most to anomaly score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">Neighbor Context</Badge>
                    <span>How neighbors influence the anomaly classification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">Subgraph Pattern</Badge>
                    <span>Local graph pattern type (star, clique, chain, bridge, isolated)</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="font-medium text-foreground">Anomaly Profile:</p>
                  <p>Primary type: structural / contextual / combined</p>
                  <p>Confidence and severity assessment</p>
                  <p>Suggested action: investigate / flag / quarantine / ignore</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 4: Benchmark */}
        <TabsContent value="benchmark" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Anomaly Detection Benchmark</CardTitle>
                <Badge className="bg-red-900 text-red-200 text-xs">All Methods</Badge>
              </div>
              <CardDescription className="text-xs">
                Compare all 6 anomaly detection methods with Precision, Recall, F1, AUROC ranking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Num Trials</Label>
                  <Input type="number" value={benchTrials} onChange={e => setBenchTrials(+e.target.value)} className="h-8 text-xs" min={3} max={20} />
                </div>
                <div className="flex items-end">
                  <Label className="text-xs text-muted-foreground">
                    Methods: DOMINANT, DONE, AnomalyDAE, GAAN, GUIDE, CONAD
                  </Label>
                </div>
              </div>
              <Button onClick={handleBenchmark} disabled={loading} size="sm" className="w-full">
                Run Full Benchmark
              </Button>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Detecting anomalies...</div>
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
