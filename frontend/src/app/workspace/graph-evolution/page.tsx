"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const EVOLUTION_STRATEGIES = [
  { value: "punctuated_equilibrium", label: "Punctuated Equilibrium", desc: "Evolution via rapid shifts + stasis" },
  { value: "gradual_adaptation", label: "Gradual Adaptation", desc: "Incremental improvements" },
  { value: "adaptive_radiation", label: "Adaptive Radiation", desc: "Diversify into niches" },
  { value: "coevolutionary_dynamics", label: "Coevolutionary", desc: "Competitive/interactive evolution" },
  { value: "exaptation_leveraging", label: "Exaptation", desc: "Repurpose existing features" },
  { value: "ai_directed_evolution", label: "AI-Directed", desc: "Guided by meta-learner" },
];

const MUTATION_OPERATORS = [
  { value: "point_mutation", label: "Point Mutation", desc: "Single parameter tweak" },
  { value: "gene_duplication", label: "Gene Duplication", desc: "Duplicate & diverge" },
  { value: "crossover_recombination", label: "Crossover", desc: "Combine parents" },
  { value: "inversion_rearrangement", label: "Inversion", desc: "Reverse segment" },
  { value: "transposition_insertion", label: "Transposition", desc: "Move + insert" },
  { value: "ai_structural_mutation", label: "AI Structural", desc: "Architecture-level changes" },
];

const FITNESS_LANDSCAPES = [
  { value: "rugged_fitness", label: "Rugged", desc: "Many local optima" },
  { value: "smooth_gradient", label: "Smooth", desc: "Single global optimum" },
  { value: "neutral_network", label: "Neutral Network", desc: "Plateaus of equal fitness" },
  { value: "holey_landscape", label: "Holey", desc: "Disconnected fitness regions" },
  { value: "red_queen_dynamics", label: "Red Queen", desc: "Continuous adaptation needed" },
  { value: "ai_dynamic_landscape", label: "Dynamic", desc: "Landscape changes over time" },
];

const SELECTION_PRESSURES = [
  { value: "truncation_selection", label: "Truncation", desc: "Top-K cutoff" },
  { value: "tournament_selection", label: "Tournament", desc: "Competitive selection" },
  { value: "fitness_proportionate", label: "Fitness Prop.", desc: "Weighted by fitness" },
  { value: "rank_based", label: "Rank-Based", desc: "Weighted by rank" },
  { value: "spatial_selection", label: "Spatial", desc: "Geographic/cluster-based" },
  { value: "ai_multiobjective", label: "Multi-Objective", desc: "Pareto front selection" },
];

const ADAPTATION_MODES = [
  { value: "phenotype_plasticity", label: "Phenotype Plasticity", desc: "Environment-responsive" },
  { value: "genetic_assimilation", label: "Genetic Assimilation", desc: "Plastic → genetic" },
  { value: "baldwin_effect", label: "Baldwin Effect", desc: "Learning guides evolution" },
  { value: "developmental_bias", label: "Developmental Bias", desc: "Constraints on variation" },
  { value: "niche_construction", label: "Niche Construction", desc: "Modify environment" },
  { value: "ai_meta_adaptation", label: "Meta-Adaptation", desc: "Self-modifying adaptation" },
];

const EMERGENCE_CATEGORIES = [
  { value: "weak_emergence", label: "Weak Emergence", desc: "Complex from simple rules" },
  { value: "strong_emergence", label: "Strong Emergence", desc: "Novel properties" },
  { value: "computational_irreducibility", label: "Computational Irreducibility", desc: "No shortcuts" },
  { value: "self_organized_criticality", label: "Self-Organized Criticality", desc: "Power law scaling" },
  { value: "phase_transition", label: "Phase Transition", desc: "Abrupt regime change" },
  { value: "ai_novel_emergence", label: "AI Novel Emergence", desc: "Unprecedented intelligence" },
];

export default function GraphEvolutionPage() {
  const [activeTab, setActiveTab] = useState("evolve");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Evolve params
  const [strategy, setStrategy] = useState("punctuated_equilibrium");
  const [mutation, setMutation] = useState("point_mutation");
  const [landscape, setLandscape] = useState("rugged_fitness");
  const [selection, setSelection] = useState("tournament_selection");
  const [adaptation, setAdaptation] = useState("phenotype_plasticity");
  const [generations, setGenerations] = useState(100);
  const [populationSize, setPopulationSize] = useState(50);

  // Mutate params
  const [mutMutationRate, setMutMutationRate] = useState(0.05);
  const [targetGenome, setTargetGenome] = useState("causal_reasoning_strategy");

  // Select params
  const [topK, setTopK] = useState(5);
  const [diversityThreshold, setDiversityThreshold] = useState(0.3);

  // Crossover params
  const [crossoverRate, setCrossoverRate] = useState(0.7);
  const [parents, setParents] = useState<string[]>(["parent_0", "parent_1", "parent_2", "parent_3"]);

  // Meta-Learn params
  const [metaEpisodes, setMetaEpisodes] = useState(10);

  // Discover params
  const [emergence, setEmergence] = useState("weak_emergence");
  const [discoverGenerations, setDiscoverGenerations] = useState(100);
  const [detectionThreshold, setDetectionThreshold] = useState(0.8);

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

  const handleEvolve = () => callAPI("/causal-autonomous-evolution/evolve", {
    strategy, mutation, landscape, selection, adaptation, generations, population_size: populationSize
  });

  const handleMutate = () => callAPI("/causal-autonomous-evolution/mutate", {
    mutation, adaptation, mutation_rate: mutMutationRate, target_genome: targetGenome
  });

  const handleSelect = () => callAPI("/causal-autonomous-evolution/select", {
    selection, landscape, top_k: topK, diversity_threshold: diversityThreshold
  });

  const handleCrossover = () => callAPI("/causal-autonomous-evolution/crossover", {
    mutation, adaptation, crossover_rate: crossoverRate, parents
  });

  const handleMetaLearn = () => callAPI("/causal-autonomous-evolution/meta-learn", {
    strategy, landscape, adaptation, meta_episodes: metaEpisodes
  });

  const handleDiscover = () => callAPI("/causal-autonomous-evolution/discover", {
    emergence, strategy, generations: discoverGenerations, detection_threshold: detectionThreshold
  });

  const renderResultPanel = () => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Evolution Result</CardTitle>
          {result.cached && <Badge className="bg-slate-600 text-slate-200 text-xs">Cached</Badge>}
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
          <h1 className="text-2xl font-bold">Causal Autonomous Evolution Engine</h1>
          <p className="text-muted-foreground text-sm">
            Layer 31 — Autonomous evolution of reasoning strategies with emergence detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="evolve">Evolve</TabsTrigger>
          <TabsTrigger value="mutate">Mutate & Select</TabsTrigger>
          <TabsTrigger value="crossover">Crossover & Meta</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        {/* Tab 1: Evolve */}
        <TabsContent value="evolve" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Autonomous Evolution</CardTitle>
                <Badge className="bg-purple-900 text-purple-200 text-xs">Layer 31</Badge>
              </div>
              <CardDescription className="text-xs">
                Evolve causal reasoning strategies across generations using genetic operators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Evolution Strategy</Label>
                  <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {EVOLUTION_STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Mutation Operator</Label>
                  <select value={mutation} onChange={e => setMutation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {MUTATION_OPERATORS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Fitness Landscape</Label>
                  <select value={landscape} onChange={e => setLandscape(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {FITNESS_LANDSCAPES.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Selection Pressure</Label>
                  <select value={selection} onChange={e => setSelection(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {SELECTION_PRESSURES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Adaptation Mode</Label>
                  <select value={adaptation} onChange={e => setAdaptation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {ADAPTATION_MODES.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Config Space</Label>
                  <div className="h-8 text-xs flex items-center text-muted-foreground">6^6 = 46,656</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Generations</Label>
                  <Input type="number" value={generations} onChange={e => setGenerations(+e.target.value)} className="h-8 text-xs" min={10} max={500} />
                </div>
                <div>
                  <Label className="text-xs">Population Size</Label>
                  <Input type="number" value={populationSize} onChange={e => setPopulationSize(+e.target.value)} className="h-8 text-xs" min={10} max={200} />
                </div>
              </div>
              <Button onClick={handleEvolve} disabled={loading} size="sm" className="w-full">Run Evolution</Button>
            </CardContent>
          </Card>

          {/* Strategy Description */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evolution Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {EVOLUTION_STRATEGIES.map(s => (
                  <div key={s.value} className={`p-2 rounded ${strategy === s.value ? "bg-purple-900/30 border border-purple-700" : "bg-muted/50"}`}>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-muted-foreground">{s.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 2: Mutate & Select */}
        <TabsContent value="mutate" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mutate */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Mutation</CardTitle>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">Variation</Badge>
                </div>
                <CardDescription className="text-xs">
                  Apply mutations to reasoning strategies to explore search space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Mutation Operator</Label>
                    <select value={mutation} onChange={e => setMutation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {MUTATION_OPERATORS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Adaptation Mode</Label>
                    <select value={adaptation} onChange={e => setAdaptation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {ADAPTATION_MODES.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Mutation Rate</Label>
                    <Input type="number" value={mutMutationRate} onChange={e => setMutMutationRate(+e.target.value)} className="h-8 text-xs" step={0.01} min={0} max={1} />
                  </div>
                  <div>
                    <Label className="text-xs">Target Genome</Label>
                    <Input value={targetGenome} onChange={e => setTargetGenome(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleMutate} disabled={loading} size="sm" className="w-full">Apply Mutations</Button>
              </CardContent>
            </Card>

            {/* Select */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Selection</CardTitle>
                  <Badge className="bg-green-900 text-green-200 text-xs">Survival</Badge>
                </div>
                <CardDescription className="text-xs">
                  Select fittest strategies from evolved population
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Selection Pressure</Label>
                    <select value={selection} onChange={e => setSelection(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {SELECTION_PRESSURES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Fitness Landscape</Label>
                    <select value={landscape} onChange={e => setLandscape(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {FITNESS_LANDSCAPES.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Top K</Label>
                    <Input type="number" value={topK} onChange={e => setTopK(+e.target.value)} className="h-8 text-xs" min={1} max={20} />
                  </div>
                  <div>
                    <Label className="text-xs">Diversity Threshold</Label>
                    <Input type="number" value={diversityThreshold} onChange={e => setDiversityThreshold(+e.target.value)} className="h-8 text-xs" step={0.1} min={0} max={1} />
                  </div>
                </div>
                <Button onClick={handleSelect} disabled={loading} size="sm" className="w-full">Select Fittest</Button>
              </CardContent>
            </Card>
          </div>

          {/* Mutation Operators */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mutation Operators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {MUTATION_OPERATORS.map(m => (
                  <div key={m.value} className={`p-2 rounded ${mutation === m.value ? "bg-blue-900/30 border border-blue-700" : "bg-muted/50"}`}>
                    <div className="font-medium">{m.label}</div>
                    <div className="text-muted-foreground">{m.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 3: Crossover & Meta */}
        <TabsContent value="crossover" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crossover */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Crossover</CardTitle>
                  <Badge className="bg-pink-900 text-pink-200 text-xs">Recombination</Badge>
                </div>
                <CardDescription className="text-xs">
                  Combine parent strategies to create novel offspring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Mutation Operator</Label>
                    <select value={mutation} onChange={e => setMutation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {MUTATION_OPERATORS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Adaptation Mode</Label>
                    <select value={adaptation} onChange={e => setAdaptation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {ADAPTATION_MODES.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Crossover Rate</Label>
                    <Input type="number" value={crossoverRate} onChange={e => setCrossoverRate(+e.target.value)} className="h-8 text-xs" step={0.1} min={0} max={1} />
                  </div>
                  <div>
                    <Label className="text-xs">Parents (comma sep.)</Label>
                    <Input value={parents.join(",")} onChange={e => setParents(e.target.value.split(",").map(s => s.trim()))} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleCrossover} disabled={loading} size="sm" className="w-full">Crossover Parents</Button>
              </CardContent>
            </Card>

            {/* Meta-Learn */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Meta-Learning</CardTitle>
                  <Badge className="bg-amber-900 text-amber-200 text-xs">Self-Improvement</Badge>
                </div>
                <CardDescription className="text-xs">
                  Learn optimal evolution parameters through meta-episodes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Evolution Strategy</Label>
                    <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {EVOLUTION_STRATEGIES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Fitness Landscape</Label>
                    <select value={landscape} onChange={e => setLandscape(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {FITNESS_LANDSCAPES.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Adaptation Mode</Label>
                    <select value={adaptation} onChange={e => setAdaptation(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {ADAPTATION_MODES.map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Meta Episodes</Label>
                    <Input type="number" value={metaEpisodes} onChange={e => setMetaEpisodes(+e.target.value)} className="h-8 text-xs" min={5} max={50} />
                  </div>
                </div>
                <Button onClick={handleMetaLearn} disabled={loading} size="sm" className="w-full">Meta-Learn Parameters</Button>
              </CardContent>
            </Card>
          </div>

          {/* Selection Pressures */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Selection Pressures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {SELECTION_PRESSURES.map(s => (
                  <div key={s.value} className={`p-2 rounded ${selection === s.value ? "bg-green-900/30 border border-green-700" : "bg-muted/50"}`}>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-muted-foreground">{s.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 4: Discover */}
        <TabsContent value="discover" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Emergence Discovery</CardTitle>
                <Badge className="bg-red-900 text-red-200 text-xs">Novelty</Badge>
              </div>
              <CardDescription className="text-xs">
                Detect emergent phenomena in evolved systems beyond individual agents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Emergence Category</Label>
                  <select value={emergence} onChange={e => setEmergence(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {EMERGENCE_CATEGORIES.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Evolution Strategy</Label>
                  <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    {EVOLUTION_STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Detection Threshold</Label>
                  <Input type="number" value={detectionThreshold} onChange={e => setDetectionThreshold(+e.target.value)} className="h-8 text-xs" step={0.1} min={0} max={1} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Generations to Monitor</Label>
                <Input type="number" value={discoverGenerations} onChange={e => setDiscoverGenerations(+e.target.value)} className="h-8 text-xs" min={10} max={500} />
              </div>
              <Button onClick={handleDiscover} disabled={loading} size="sm" className="w-full">Discover Emergent Phenomena</Button>
            </CardContent>
          </Card>

          {/* Emergence Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emergence Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {EMERGENCE_CATEGORIES.map(e => (
                  <div key={e.value} className={`p-2 rounded ${emergence === e.value ? "bg-red-900/30 border border-red-700" : "bg-muted/50"}`}>
                    <div className="font-medium">{e.label}</div>
                    <div className="text-muted-foreground">{e.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Running evolution simulation...</div>
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