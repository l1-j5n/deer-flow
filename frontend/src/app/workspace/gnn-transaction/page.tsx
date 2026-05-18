"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "";

interface GNNResult {
  layers: number;
  hidden_dim: number;
  embedding_dim: number;
  entity_count: number;
}

interface EntityLayerResult {
  entity: string;
  layer: number;
  embedding: number[];
  dims: number;
}

interface PoolingResult {
  aggregation: string;
  graph_embedding: number[];
  num_nodes: number;
}

interface TransactionResult {
  atomic: boolean;
  total_operations: number;
  results: Array<{ action: string; status: string }>;
  failed: Array<{ action: string; status: string; error?: string }>;
}

interface SingleTransaction {
  status: string;
  entity_id?: string;
  message?: string;
}

interface TransactionLog {
  transactions: Array<{ timestamp: string; operations: number; success: number; failed: number }>;
  total: number;
}

interface ExportResult {
  format: string;
  entity_count: number;
  relation_count: number;
}

interface ExportFormats {
  formats: string[];
  compressions: string[];
}

interface GNNSummary {
  cached_models: number;
  num_nodes: number;
}

interface TransactionSummary {
  total_transactions: number;
  successful_transactions: number;
  total_operations: number;
}

export default function GNNTransactionPage() {
  const [activeTab, setActiveTab] = useState("gnn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // GNN state
  const [layers, setLayers] = useState(2);
  const [hiddenDim, setHiddenDim] = useState(64);
  const [aggregation, setAggregation] = useState("mean");
  const [gnnResult, setGnnResult] = useState<GNNResult | null>(null);
  const [entityLayer, setEntityLayer] = useState<EntityLayerResult | null>(null);
  const [gnnEntity, setGnnEntity] = useState("");
  const [layerNum, setLayerNum] = useState(1);
  const [poolingResult, setPoolingResult] = useState<PoolingResult | null>(null);
  const [gnnSummary, setGnnSummary] = useState<GNNSummary | null>(null);

  // Transaction state
  const [operations, setOperations] = useState("");
  const [transResult, setTransResult] = useState<TransactionResult | null>(null);
  const [singleTrans, setSingleTrans] = useState<SingleTransaction | null>(null);
  const [transEntity, setTransEntity] = useState("");
  const [transAction, setTransAction] = useState("create");
  const [transData, setTransData] = useState("");
  const [transLog, setTransLog] = useState<TransactionLog | null>(null);
  const [transSummary, setTransSummary] = useState<TransactionSummary | null>(null);

  // Export state
  const [exportFormat, setExportFormat] = useState("json");
  const [exportEntities, setExportEntities] = useState(true);
  const [exportRelations, setExportRelations] = useState(true);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [exportFormats, setExportFormats] = useState<ExportFormats | null>(null);
  const [subgraphEntities, setSubgraphEntities] = useState("");
  const [subgraphExport, setSubgraphExport] = useState<ExportResult | null>(null);

  // GNN functions
  const computeGNN = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/gnn/layers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layers: layers,
          hidden_dim: hiddenDim,
          aggregation: aggregation,
        }),
      });
      const data = await res.json();
      setGnnResult(data);
    } catch (e) {
      setError("Failed to compute GNN");
    }
    setLoading(false);
  };

  const getEntityLayer = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/gnn/entity-layer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: gnnEntity,
          layer: layerNum,
        }),
      });
      const data = await res.json();
      setEntityLayer(data);
    } catch (e) {
      setError("Failed to get entity layer");
    }
    setLoading(false);
  };

  const runPooling = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/gnn/pooling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aggregation: aggregation }),
      });
      const data = await res.json();
      setPoolingResult(data);
    } catch (e) {
      setError("Failed to run pooling");
    }
    setLoading(false);
  };

  const getGnnSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/gnn/summary`);
      const data = await res.json();
      setGnnSummary(data);
    } catch (e) {
      console.error("Failed to get GNN summary");
    }
  };

  // Transaction functions
  const runTransaction = async () => {
    setLoading(true);
    setError("");
    try {
      const ops = JSON.parse(operations);
      const res = await fetch(`${API_BASE}/api/knowledge-graph/transaction/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operations: ops,
          atomic: true,
        }),
      });
      const data = await res.json();
      setTransResult(data);
    } catch (e) {
      setError("Failed to run transaction - check JSON format");
    }
    setLoading(false);
  };

  const runSingleTransaction = async () => {
    setLoading(true);
    setError("");
    try {
      const data = transData ? JSON.parse(transData) : {};
      const res = await fetch(`${API_BASE}/api/knowledge-graph/transaction/entity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: transEntity,
          action: transAction,
          data: data,
        }),
      });
      const result = await res.json();
      setSingleTrans(result);
    } catch (e) {
      setError("Failed to run transaction");
    }
    setLoading(false);
  };

  const getTransLog = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/transaction/log`);
      const data = await res.json();
      setTransLog(data);
    } catch (e) {
      console.error("Failed to get transaction log");
    }
  };

  const getTransSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/transaction/summary`);
      const data = await res.json();
      setTransSummary(data);
    } catch (e) {
      console.error("Failed to get transaction summary");
    }
  };

  // Export functions
  const runExport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/export/graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: exportFormat,
          include_entities: exportEntities,
          include_relations: exportRelations,
        }),
      });
      const data = await res.json();
      setExportResult(data);
    } catch (e) {
      setError("Failed to export");
    }
    setLoading(false);
  };

  const getExportFormats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/export/formats`);
      const data = await res.json();
      setExportFormats(data);
    } catch (e) {
      console.error("Failed to get formats");
    }
  };

  const exportSubgraph = async () => {
    setLoading(true);
    setError("");
    try {
      const ids = subgraphEntities.split(",").filter(Boolean);
      const res = await fetch(`${API_BASE}/api/knowledge-graph/export/subgraph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_ids: ids,
          format: exportFormat,
        }),
      });
      const data = await res.json();
      setSubgraphExport(data);
    } catch (e) {
      setError("Failed to export subgraph");
    }
    setLoading(false);
  };

  useEffect(() => {
    getGnnSummary();
    getTransSummary();
    getExportFormats();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GNN & Transaction</h1>
          <p className="text-muted-foreground">
            Graph neural networks, transactions, and graph export
          </p>
        </div>
        <Badge variant="outline">v1.57</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gnn">GNN Layers</TabsTrigger>
          <TabsTrigger value="transaction">Transactions</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* GNN Tab */}
        <TabsContent value="gnn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compute GNN Layers</CardTitle>
                <CardDescription>Run GNN message passing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Layers</Label>
                    <Input
                      type="number"
                      value={layers}
                      onChange={(e) => setLayers(Number(e.target.value))}
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
                </div>
                <div>
                  <Label>Aggregation</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value)}
                  >
                    <option value="mean">Mean</option>
                    <option value="max">Max</option>
                    <option value="sum">Sum</option>
                    <option value="graph_conv">Graph Convolution</option>
                  </select>
                </div>
                <Button onClick={computeGNN} disabled={loading}>
                  Compute GNN
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity GNN Layer</CardTitle>
                <CardDescription>Get embedding for layer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={gnnEntity}
                  onChange={(e) => setGnnEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    value={layerNum}
                    onChange={(e) => setLayerNum(Number(e.target.value))}
                    placeholder="Layer"
                  />
                  <Button onClick={getEntityLayer} disabled={loading}>
                    Get Layer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Graph Pooling</CardTitle>
                <CardDescription>Pool graph to single embedding</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={runPooling} disabled={loading}>
                  Pool Graph
                </Button>
              </CardContent>
            </Card>

            {/* GNN Result */}
            {gnnResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>GNN Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Layers</p>
                      <p className="font-bold">{gnnResult.layers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hidden Dim</p>
                      <p className="font-bold">{gnnResult.hidden_dim}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Embedding Dim</p>
                      <p className="font-bold">{gnnResult.embedding_dim}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold">{gnnResult.entity_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entity Layer */}
            {entityLayer && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Layer {entityLayer.layer}: {entityLayer.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <p className="font-mono text-sm">
                      [{entityLayer.embedding.slice(0, 8).join(", ")}...]
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Pooling Result */}
            {poolingResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Graph Embedding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nodes: {poolingResult.num_nodes}
                  </p>
                  <p className="font-mono text-sm mt-2">
                    [{poolingResult.graph_embedding.slice(0, 8).join(", ")}...]
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Transaction Tab */}
        <TabsContent value="transaction">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Transaction</CardTitle>
                <CardDescription>Execute multiple operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={operations}
                  onChange={(e) => setOperations(e.target.value)}
                  placeholder='[{"action": "add_entity", "data": {"id": "e1"}}]'
                  className="h-32 font-mono"
                />
                <Button onClick={runTransaction} disabled={loading}>
                  Execute
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Single Entity Transaction</CardTitle>
                <CardDescription>CRUD on single entity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={transEntity}
                  onChange={(e) => setTransEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="border rounded p-2"
                    value={transAction}
                    onChange={(e) => setTransAction(e.target.value)}
                  >
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                  </select>
                  <Button onClick={runSingleTransaction} disabled={loading}>
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Log</CardTitle>
                <CardDescription>View recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getTransLog} variant="outline">
                  Refresh Log
                </Button>
              </CardContent>
            </Card>

            {/* Batch Result */}
            {transResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Transaction Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold">{transResult.total_operations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success</p>
                      <p className="font-bold text-green-500">
                        {transResult.results.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="font-bold text-red-500">
                        {transResult.failed.length}
                      </p>
                    </div>
                  </div>
                  {transResult.results.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {transResult.results.slice(0, 5).map((r, idx) => (
                        <Badge key={idx} variant="outline">
                          {r.action}: {r.status}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Single Transaction Result */}
            {singleTrans && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={singleTrans.status === "error" ? "destructive" : "default"}
                  >
                    {singleTrans.status}
                  </Badge>
                  {singleTrans.message && (
                    <p className="mt-2">{singleTrans.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transaction Log */}
            {transLog && transLog.transactions.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {transLog.transactions.slice(0, 10).map((t, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-mono text-sm">
                            {new Date(t.timestamp).toLocaleTimeString()}
                          </span>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              Ops: {t.operations}
                            </Badge>
                            <Badge variant="secondary">
                              Success: {t.success}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Graph</CardTitle>
                <CardDescription>Export full graph</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Format</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="turtle">Turtle (RDF)</option>
                    <option value="jsonld">JSON-LD</option>
                    <option value="networkx">NetworkX</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={exportEntities}
                      onChange={(e) => setExportEntities(e.target.checked)}
                    />
                    Entities
                  </label>
                  <label className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={exportRelations}
                      onChange={(e) => setExportRelations(e.target.checked)}
                    />
                    Relations
                  </label>
                </div>
                <Button onClick={runExport} disabled={loading}>
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Subgraph</CardTitle>
                <CardDescription>Export subset of entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={subgraphEntities}
                  onChange={(e) => setSubgraphEntities(e.target.value)}
                  placeholder="entity1, entity2, entity3"
                  className="h-20"
                />
                <Button onClick={exportSubgraph} disabled={loading}>
                  Export Subgraph
                </Button>
              </CardContent>
            </Card>

            {/* Export Result */}
            {exportResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Export Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Format</p>
                      <p className="font-mono">{exportResult.format}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold text-2xl">
                        {exportResult.entity_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relations</p>
                      <p className="font-bold text-2xl">
                        {exportResult.relation_count}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subgraph Export */}
            {subgraphExport && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Subgraph Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold text-2xl">
                        {subgraphExport.entity_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relations</p>
                      <p className="font-bold text-2xl">
                        {subgraphExport.relation_count}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}