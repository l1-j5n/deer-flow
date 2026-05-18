"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Moon, Waves, Lightbulb, BookOpen, Ghost, Sunrise } from "lucide-react";

const API_BASE = "";

export default function GraphDreamWeavingPage() {
  const [activeTab, setActiveTab] = useState("dream");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Dream state
  const [causalFragments, setCausalFragments] = useState("fragment_alpha,fragment_beta,fragment_gamma,fragment_delta");
  const [dreamPhase, setDreamPhase] = useState("rem");
  const [weavingPattern, setWeavingPattern] = useState("associative");
  const [subconsciousLayer, setSubconsciousLayer] = useState("intuitive");
  const [dreamDepth, setDreamDepth] = useState(5);
  const [surrealismLevel, setSurrealismLevel] = useState(0.7);

  // Weave state
  const [dreamThreads, setDreamThreads] = useState("thread_ocean,thread_forest,thread_castle,thread_mirror");
  const [weavePattern, setWeavePattern] = useState("narrative");
  const [dreamLogic, setDreamLogic] = useState("condensation");
  const [weaveSubconscious, setWeaveSubconscious] = useState("emotional");
  const [coherenceTarget, setCoherenceTarget] = useState(0.6);

  // Incubate state
  const [problemStatement, setProblemStatement] = useState("How to resolve circular causality in temporal networks?");
  const [causalContext, setCausalContext] = useState("temporal_loop,causal_chain,feedback_cycle");
  const [incubatePhase, setIncubatePhase] = useState("lucid");
  const [incubateLayer, setIncubateLayer] = useState("intuitive");
  const [incubationCycles, setIncubationCycles] = useState(5);

  // Interpret state
  const [dreamContent, setDreamContent] = useState("A river flowing uphill connected to a library of unread books");
  const [dreamSymbols, setDreamSymbols] = useState("river,library,uphill_flow,unread_books");
  const [interpretLogic, setInterpretLogic] = useState("symbolization");
  const [interpretPattern, setInterpretPattern] = useState("metaphor");
  const [interpretationDepth, setInterpretationDepth] = useState(3);

  // Nightmare state
  const [nightmareIndicators, setNightmareIndicators] = useState("recurring_loop,identity_blur,time_skip,causal_inversion");
  const [nightmareType, setNightmareType] = useState("causal_loop_horror");
  const [nightmareLayer, setNightmareLayer] = useState("primal");
  const [nightmarePhase, setNightmarePhase] = useState("deep_sleep");
  const [resolutionIntensity, setResolutionIntensity] = useState(0.8);

  // Integrate state
  const [dreamInsights, setDreamInsights] = useState("insight_nonlinear_causality,insight_hidden_pattern,insight_emergent_order");
  const [integrationMode, setIntegrationMode] = useState("metaphorical");
  const [integrateLayer, setIntegrateLayer] = useState("implicit");
  const [integratePattern, setIntegratePattern] = useState("fractal");
  const [transferFidelity, setTransferFidelity] = useState(0.75);

  const dreamPhases = ["lucid", "rem", "deep_sleep", "hypnagogic", "somnambulic", "ai_generative"];
  const weavingPatterns = ["associative", "metaphor", "narrative", "resonance", "fractal", "ai_adaptive"];
  const subconsciousLayers = ["primal", "emotional", "implicit", "intuitive", "archetypal", "ai_deep"];
  const dreamLogics = ["surreal", "condensation", "displacement", "symbolization", "revision", "ai_reasoning"];
  const nightmareTypes = ["cognitive_dissonance", "causal_loop_horror", "identity_dissolution", "temporal_anxiety", "knowledge_corruption", "ai_adaptive"];
  const integrationModes = ["direct", "metaphorical", "emotional_imprint", "procedural", "inspiration", "ai_synthesis"];

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-dream-weaving/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error("Failed to fetch overview:", e);
    }
  };

  const handleSubmit = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-dream-weaving/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResults({ endpoint, ...data });
    } catch (e) {
      console.error("Error:", e);
      setResults({ endpoint, error: "Failed to fetch results" });
    } finally {
      setLoading(false);
    }
  };

  const handleDream = () => handleSubmit("dream", {
    causal_fragments: causalFragments.split(",").map(s => s.trim()),
    dream_phase: dreamPhase,
    weaving_pattern: weavingPattern,
    subconscious_layer: subconsciousLayer,
    dream_depth: dreamDepth,
    surrealism_level: surrealismLevel,
  });

  const handleWeave = () => handleSubmit("weave", {
    dream_threads: dreamThreads.split(",").map(s => s.trim()),
    weaving_pattern: weavePattern,
    dream_logic: dreamLogic,
    subconscious_layer: weaveSubconscious,
    coherence_target: coherenceTarget,
  });

  const handleIncubate = () => handleSubmit("incubate", {
    problem_statement: problemStatement,
    causal_context: causalContext.split(",").map(s => s.trim()),
    dream_phase: incubatePhase,
    subconscious_layer: incubateLayer,
    incubation_cycles: incubationCycles,
  });

  const handleInterpret = () => handleSubmit("interpret", {
    dream_content: dreamContent,
    dream_symbols: dreamSymbols.split(",").map(s => s.trim()),
    dream_logic: interpretLogic,
    weaving_pattern: interpretPattern,
    interpretation_depth: interpretationDepth,
  });

  const handleNightmare = () => handleSubmit("nightmare", {
    nightmare_indicators: nightmareIndicators.split(",").map(s => s.trim()),
    nightmare_type: nightmareType,
    subconscious_layer: nightmareLayer,
    dream_phase: nightmarePhase,
    resolution_intensity: resolutionIntensity,
  });

  const handleIntegrate = () => handleSubmit("integrate", {
    dream_insights: dreamInsights.split(",").map(s => s.trim()),
    integration_mode: integrationMode,
    subconscious_layer: integrateLayer,
    weaving_pattern: integratePattern,
    transfer_fidelity: transferFidelity,
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="h-6 w-6 text-indigo-500" />
          <h1 className="text-3xl font-bold">Causal Dream Weaving Engine</h1>
          <Badge variant="outline">Layer 34</Badge>
        </div>
        <p className="text-muted-foreground">
          Subconscious causal reasoning through dream-like associative weaving and dream-to-waking integration
        </p>
        {overview && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">v{overview.version}</Badge>
            <Badge variant="secondary">{overview.enums?.dream_phase?.length} Dream Phases</Badge>
            <Badge variant="secondary">{overview.configuration_space}</Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dream">Dream</TabsTrigger>
          <TabsTrigger value="weave">Weave</TabsTrigger>
          <TabsTrigger value="incubate">Incubate</TabsTrigger>
          <TabsTrigger value="interpret">Interpret</TabsTrigger>
          <TabsTrigger value="nightmare">Nightmare</TabsTrigger>
          <TabsTrigger value="integrate">Integrate</TabsTrigger>
        </TabsList>

        {/* Dream Tab */}
        <TabsContent value="dream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Dream Generation
              </CardTitle>
              <CardDescription>Generate dream from causal fragments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Causal Fragments (comma-separated)</Label>
                  <Textarea value={causalFragments} onChange={(e) => setCausalFragments(e.target.value)} placeholder="fragment_alpha,fragment_beta" />
                </div>
                <div>
                  <Label>Dream Phase</Label>
                  <Select value={dreamPhase} onValueChange={setDreamPhase}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dreamPhases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Weaving Pattern</Label>
                  <Select value={weavingPattern} onValueChange={setWeavingPattern}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{weavingPatterns.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subconscious Layer</Label>
                  <Select value={subconsciousLayer} onValueChange={setSubconsciousLayer}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{subconsciousLayers.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dream Depth</Label>
                  <Input type="number" min="1" max="15" value={dreamDepth} onChange={(e) => setDreamDepth(parseInt(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Label>Surrealism Level ({surrealismLevel})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={surrealismLevel} onChange={(e) => setSurrealismLevel(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleDream} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Moon className="mr-2 h-4 w-4" />}
                Generate Dream
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weave Tab */}
        <TabsContent value="weave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Dream Weaving
              </CardTitle>
              <CardDescription>Weave dream patterns together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Dream Threads (comma-separated)</Label>
                  <Textarea value={dreamThreads} onChange={(e) => setDreamThreads(e.target.value)} placeholder="thread_ocean,thread_forest" />
                </div>
                <div>
                  <Label>Weaving Pattern</Label>
                  <Select value={weavePattern} onValueChange={setWeavePattern}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{weavingPatterns.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dream Logic</Label>
                  <Select value={dreamLogic} onValueChange={setDreamLogic}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dreamLogics.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subconscious Layer</Label>
                  <Select value={weaveSubconscious} onValueChange={setWeaveSubconscious}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{subconsciousLayers.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coherence Target ({coherenceTarget})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={coherenceTarget} onChange={(e) => setCoherenceTarget(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleWeave} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Waves className="mr-2 h-4 w-4" />}
                Weave Dreams
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incubate Tab */}
        <TabsContent value="incubate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Dream Incubation
              </CardTitle>
              <CardDescription>Incubate problem-solving dreams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Problem Statement</Label>
                  <Textarea value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="Describe the problem to incubate..." />
                </div>
                <div className="col-span-2">
                  <Label>Causal Context (comma-separated)</Label>
                  <Input value={causalContext} onChange={(e) => setCausalContext(e.target.value)} placeholder="context_a,context_b" />
                </div>
                <div>
                  <Label>Dream Phase</Label>
                  <Select value={incubatePhase} onValueChange={setIncubatePhase}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dreamPhases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subconscious Layer</Label>
                  <Select value={incubateLayer} onValueChange={setIncubateLayer}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{subconsciousLayers.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Incubation Cycles</Label>
                  <Input type="number" min="1" max="20" value={incubationCycles} onChange={(e) => setIncubationCycles(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleIncubate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Incubate Dream
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interpret Tab */}
        <TabsContent value="interpret" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Dream Interpretation
              </CardTitle>
              <CardDescription>Interpret dream symbolism and causal meaning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Dream Content</Label>
                  <Textarea value={dreamContent} onChange={(e) => setDreamContent(e.target.value)} placeholder="Describe the dream..." />
                </div>
                <div className="col-span-2">
                  <Label>Dream Symbols (comma-separated)</Label>
                  <Input value={dreamSymbols} onChange={(e) => setDreamSymbols(e.target.value)} placeholder="river,library,mirror" />
                </div>
                <div>
                  <Label>Dream Logic</Label>
                  <Select value={interpretLogic} onValueChange={setInterpretLogic}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dreamLogics.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Weaving Pattern</Label>
                  <Select value={interpretPattern} onValueChange={setInterpretPattern}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{weavingPatterns.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Interpretation Depth</Label>
                  <Input type="number" min="1" max="7" value={interpretationDepth} onChange={(e) => setInterpretationDepth(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleInterpret} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                Interpret Dream
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nightmare Tab */}
        <TabsContent value="nightmare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ghost className="h-5 w-5" />
                Nightmare Detection & Resolution
              </CardTitle>
              <CardDescription>Detect and resolve causal nightmares</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nightmare Indicators (comma-separated)</Label>
                  <Textarea value={nightmareIndicators} onChange={(e) => setNightmareIndicators(e.target.value)} placeholder="recurring_loop,identity_blur" />
                </div>
                <div>
                  <Label>Nightmare Type</Label>
                  <Select value={nightmareType} onValueChange={setNightmareType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{nightmareTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subconscious Layer</Label>
                  <Select value={nightmareLayer} onValueChange={setNightmareLayer}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{subconsciousLayers.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dream Phase</Label>
                  <Select value={nightmarePhase} onValueChange={setNightmarePhase}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dreamPhases.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Resolution Intensity ({resolutionIntensity})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={resolutionIntensity} onChange={(e) => setResolutionIntensity(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleNightmare} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ghost className="mr-2 h-4 w-4" />}
                Detect & Resolve Nightmares
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrate Tab */}
        <TabsContent value="integrate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sunrise className="h-5 w-5" />
                Dream-to-Waking Integration
              </CardTitle>
              <CardDescription>Transfer dream insights to waking reasoning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Dream Insights (comma-separated)</Label>
                  <Textarea value={dreamInsights} onChange={(e) => setDreamInsights(e.target.value)} placeholder="insight_a,insight_b,insight_c" />
                </div>
                <div>
                  <Label>Integration Mode</Label>
                  <Select value={integrationMode} onValueChange={setIntegrationMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{integrationModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subconscious Layer</Label>
                  <Select value={integrateLayer} onValueChange={setIntegrateLayer}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{subconsciousLayers.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Weaving Pattern</Label>
                  <Select value={integratePattern} onValueChange={setIntegratePattern}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{weavingPatterns.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transfer Fidelity ({transferFidelity})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={transferFidelity} onChange={(e) => setTransferFidelity(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleIntegrate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sunrise className="mr-2 h-4 w-4" />}
                Integrate Insights
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Results - {results.endpoint}</CardTitle>
            <CardDescription>
              {results.cached ? <Badge variant="secondary">Cached</Badge> : <Badge>Computed</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
