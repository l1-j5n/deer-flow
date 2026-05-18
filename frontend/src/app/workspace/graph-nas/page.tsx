"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const STRATEGIES = [
  { value: "random", label: "Random Search" },
  { value: "evolutionary", label: "Evolutionary" },
  { value: "darts", label: "DARTS" },
  { value: "bayesian", label: "Bayesian" },
  { value: "reinforce", label: "REINFORCE" },
  { value: "graph_cas", label: "Graph-CAS" },
];

const LAYER_TYPES = ["gcn", "gat", "sage", "transformer", "gin", "moran", "sign"];
const POOL_TYPES = ["max", "mean", "attention", "sort", "diffpool"];

export default function GraphNASPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Search config
  const [strategy, setStrategy] = useState("random");
  const [dataset, setDataset] = useState("cora");
  const [metric, setMetric] = useState("accuracy");
  const [numSamples, setNumSamples] = useState(20);
  const [layerTypes, setLayerTypes] = useState(["gcn", "gat", "sage"]);
  const [hiddenDims, setHiddenDims] = useState("64,128");

  // Evolutionary params
  const [popSize, setPopSize] = useState(20);
  const [generations, setGenerations] = useState(10);
  const [mutationRate, setMutationRate] = useState(0.1);
  const [crossoverRate, setCrossoverRate] = useState(0.3);

  // DARTS params
  const [dartsEpochs, setDartsEpochs] = useState(50);
  const [archLR, setArchLR] = useState(0.001);

  // Bayesian params
  const [bayesIterations, setBayesIterations] = useState(30);
  const [acquisition, setAcquisition] = useState("ei");

  // Few-shot
  const [numShots, setNumShots] = useState(5);

  // Continual
  const [tasks, setTasks] = useState("cora,citeseer,pubmed");

  // Results
  const [searchResult, setSearchResult] = useState<any>(null);
  const [spaceResult, setSpaceResult] = useState<any>(null);
  const [sampleResult, setSampleResult] = useState<any>(null);
  const [evoResult, setEvoResult] = useState<any>(null);
  const [dartsResult, setDartsResult] = useState<any>(null);
  const [bayesResult, setBayesResult] = useState<any>(null);
  const [fewshotResult, setFewshotResult] = useState<any>(null);
  const [continualResult, setContinualResult] = useState<any>(null);
  const [predictResult, setPredictResult] = useState<any>(null);
  const [exportResult, setExportResult] = useState<any>(null);

  const callApi = async (endpoint: string, params: any, setter: (v: any) => void) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setter(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const parsedDims = () => hiddenDims.split(",").map(Number).filter(n => !isNaN(n));

  const renderJson = (data: any) => (
    <pre className="bg-gray-950 text-green-400 p-3 rounded text-xs overflow-auto max-h-64 mt-2">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  const renderScoreBar = (score: number, label: string) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-20">{label}</span>
      <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
        <div className="bg-green-500 h-full rounded" style={{ width: `${score * 100}%` }} />
      </div>
      <span className="text-xs text-green-400 w-12 text-right">{(score * 100).toFixed(1)}%</span>
    </div>
  );

  const renderArchCard = (arch: any, score?: number) => (
    <div className="bg-gray-900 p-2 rounded space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-200">{arch.architecture_id}</span>
        {score !== undefined && <Badge>{(score * 100).toFixed(1)}%</Badge>}
      </div>
      <div className="flex gap-2 text-xs text-gray-400">
        <span>Layers: {arch.num_layers}</span>
        <span>Params: {arch.total_params?.toLocaleString()}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {arch.layers?.map((l: any, i: number) => (
          <Badge key={i} variant="outline" className="text-xs">{l.type}</Badge>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Neural Architecture Search</h1>
          <p className="text-sm text-gray-500">v1.84 — Automatically discover optimal GNN architectures</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm">Graph ID</Label>
          <Input className="w-32" value={graphId} onChange={e => setGraphId(e.target.value)} />
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm">{error}</div>}
      {loading && <div className="text-sm text-yellow-400 animate-pulse">Searching architectures...</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="search">Search Strategies</TabsTrigger>
          <TabsTrigger value="space">Search Space</TabsTrigger>
          <TabsTrigger value="advanced">Advanced NAS</TabsTrigger>
        </TabsList>

        {/* === SEARCH STRATEGIES TAB === */}
        <TabsContent value="search" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Random Search */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Random Search</CardTitle>
                <CardDescription>Uniform random sampling of architectures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Samples</Label>
                    <Input type="number" value={numSamples} onChange={e => setNumSamples(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Dataset</Label>
                    <Input value={dataset} onChange={e => setDataset(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/random-search", {
                  num_samples: numSamples, dataset, metric, layer_types: layerTypes, hidden_dims: parsedDims(),
                }, setSearchResult)}>Search</Button>
                {searchResult?.best_architecture && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Best: {searchResult.best_architecture.architecture_id} — {(searchResult.best_score * 100).toFixed(1)}%
                    </div>
                    {renderScoreBar(searchResult.best_score, "Score")}
                    {renderArchCard(searchResult.best_architecture, searchResult.best_score)}
                    <div className="text-xs text-gray-400">Time: {searchResult.search_time_seconds}s | Tested: {searchResult.num_samples}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evolutionary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolutionary Search</CardTitle>
                <CardDescription>Natural evolution with mutation & crossover</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Population</Label>
                    <Input type="number" value={popSize} onChange={e => setPopSize(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Generations</Label>
                    <Input type="number" value={generations} onChange={e => setGenerations(+e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Mutation Rate</Label>
                    <Input type="number" step="0.05" value={mutationRate} onChange={e => setMutationRate(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Crossover Rate</Label>
                    <Input type="number" step="0.05" value={crossoverRate} onChange={e => setCrossoverRate(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/evolutionary", {
                  population_size: popSize, generations, dataset, metric, layer_types: layerTypes,
                  mutation_rate: mutationRate, crossover_rate: crossoverRate,
                }, setEvoResult)}>Evolve</Button>
                {evoResult?.best_architecture && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Best Fitness: {(evoResult.best_fitness * 100).toFixed(1)}%
                    </div>
                    {renderScoreBar(evoResult.best_fitness, "Fitness")}
                    {renderArchCard(evoResult.best_architecture, evoResult.best_fitness)}
                    <div className="text-xs text-gray-400">
                      Top-5 fitness: {evoResult.final_population_fitness?.map((f: number) => (f * 100).toFixed(1)).join(", ")}%
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DARTS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">DARTS</CardTitle>
                <CardDescription>Differentiable Architecture Search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Epochs</Label>
                    <Input type="number" value={dartsEpochs} onChange={e => setDartsEpochs(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Arch LR</Label>
                    <Input type="number" step="0.0001" value={archLR} onChange={e => setArchLR(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/darts", {
                  num_epochs: dartsEpochs, dataset, metric, arch_learning_rate: archLR,
                }, setDartsResult)}>Search (DARTS)</Button>
                {dartsResult?.discovered_architecture && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Val: {(dartsResult.validation_score * 100).toFixed(1)}% | Test: {(dartsResult.test_score * 100).toFixed(1)}%
                    </div>
                    {renderScoreBar(dartsResult.validation_score, "Val")}
                    <div className="text-xs text-gray-300">Operations: {dartsResult.discovered_architecture.operations?.join(" → ")}</div>
                    {dartsResult.search_history?.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Search progress:</div>
                        {dartsResult.search_history.map((h: any) => (
                          <div key={h.epoch} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                            <span className="text-gray-400">Epoch {h.epoch}</span>
                            <span className="text-gray-300">Val loss: {h.val_loss}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bayesian */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bayesian Optimization</CardTitle>
                <CardDescription>Surrogate model-guided search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Iterations</Label>
                    <Input type="number" value={bayesIterations} onChange={e => setBayesIterations(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Acquisition</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={acquisition} onChange={e => setAcquisition(e.target.value)}>
                      <option value="ei">EI</option>
                      <option value="ucb">UCB</option>
                      <option value="thompson">Thompson</option>
                    </select>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/bayesian", {
                  num_iterations: bayesIterations, dataset, metric, acquisition,
                }, setBayesResult)}>Optimize</Button>
                {bayesResult?.best_architecture && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Best: {(bayesResult.best_score * 100).toFixed(1)}%
                    </div>
                    {renderScoreBar(bayesResult.best_score, "Score")}
                    <div className="text-xs text-gray-400">
                      Surrogate accuracy: {bayesResult.surrogate_model_accuracy} | Time: {bayesResult.search_time_seconds}s
                    </div>
                    {bayesResult.observations?.slice(0, 5).map((o: any) => (
                      <div key={o.iteration} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                        <span className="text-gray-400">Iter {o.iteration}</span>
                        <span className="text-green-400">{(o.score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === SEARCH SPACE TAB === */}
        <TabsContent value="space" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Define Search Space */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Define Search Space</CardTitle>
                <CardDescription>Configure and explore the architecture space</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs">Num Layers</Label>
                  <Input type="number" value={3} id="space-layers" />
                </div>
                <div>
                  <Label className="text-xs">Layer Types</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {LAYER_TYPES.map(lt => (
                      <Badge key={lt} variant={layerTypes.includes(lt) ? "default" : "outline"}
                        className="cursor-pointer text-xs" onClick={() => {
                          setLayerTypes(prev => prev.includes(lt) ? prev.filter(x => x !== lt) : [...prev, lt]);
                        }}>{lt}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Hidden Dims (comma-separated)</Label>
                  <Input value={hiddenDims} onChange={e => setHiddenDims(e.target.value)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/search-space", {
                  num_layers: 3, hidden_dims: parsedDims(),
                }, setSpaceResult)}>Explore Space</Button>
                {spaceResult && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      Total possible: {spaceResult.total_possible_architectures?.toLocaleString()} architectures
                    </div>
                    <div className="text-xs font-semibold text-gray-300">Sample Architectures:</div>
                    {spaceResult.sample_architectures?.slice(0, 4).map((a: any) => renderArchCard(a))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sample & Evaluate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sample & Evaluate</CardTitle>
                <CardDescription>Sample single architecture and evaluate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full" onClick={() => callApi("nas/sample", {
                  num_layers: 3, layer_types: layerTypes, hidden_dims: parsedDims(),
                }, setSampleResult)}>Sample Architecture</Button>
                {sampleResult?.sampled_architecture && (
                  <div className="space-y-2">
                    {renderArchCard(sampleResult.sampled_architecture)}
                    <Button size="sm" variant="outline" className="w-full" onClick={() => callApi("nas/predict-performance", {
                      architecture: sampleResult.sampled_architecture, predictor_type: "regression",
                    }, setPredictResult)}>Predict Performance</Button>
                    {predictResult && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-300">Predicted: {(predictResult.predicted_performance * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Predictor accuracy: {predictResult.predictor_accuracy}</div>
                      </div>
                    )}
                    <Button size="sm" variant="outline" className="w-full" onClick={() => callApi("nas/export", {
                      architecture: sampleResult.sampled_architecture, format: "pytorch",
                    }, setExportResult)}>Export PyTorch</Button>
                    {exportResult?.code && (
                      <pre className="bg-gray-950 text-green-400 p-2 rounded text-xs overflow-auto max-h-40">
                        {exportResult.code}
                      </pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === ADVANCED NAS TAB === */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Few-shot NAS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Few-shot NAS</CardTitle>
                <CardDescription>Meta-learning with very limited samples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Shots</Label>
                    <Input type="number" value={numShots} onChange={e => setNumShots(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Dataset</Label>
                    <Input value={dataset} onChange={e => setDataset(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/fewshot", {
                  num_shots: numShots, dataset, layer_types: layerTypes,
                }, setFewshotResult)}>Search (Few-shot)</Button>
                {fewshotResult && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>Best: {(fewshotResult.best_score * 100).toFixed(1)}%</Badge>
                      <Badge variant="outline">Meta: {(fewshotResult.meta_learned_score * 100).toFixed(1)}%</Badge>
                    </div>
                    {fewshotResult.tested_architectures?.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-300">{a.architecture.architecture_id}</span>
                        <span className="text-green-400">{(a.score * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Continual NAS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Continual NAS</CardTitle>
                <CardDescription>Search across sequential tasks/datasets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs">Tasks (comma-separated)</Label>
                  <Input value={tasks} onChange={e => setTasks(e.target.value)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("nas/continual", {
                  tasks: tasks.split(",").map(t => t.trim()), layer_types: layerTypes,
                }, setContinualResult)}>Search (Continual)</Button>
                {continualResult?.task_results && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>Avg: {(continualResult.average_score * 100).toFixed(1)}%</Badge>
                      <Badge variant="outline">Forgetting: {continualResult.forgetting}</Badge>
                    </div>
                    {Object.entries(continualResult.task_results).map(([task, data]: [string, any]) => (
                      <div key={task} className="flex justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-300">{task}</span>
                        <div className="flex gap-2">
                          <span className="text-green-400">{(data.score * 100).toFixed(1)}%</span>
                          <span className="text-gray-500">{data.architecture.architecture_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
