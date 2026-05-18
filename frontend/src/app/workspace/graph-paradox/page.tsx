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
import { Loader2, AlertTriangle, Shield, GitBranch, Activity, Wrench, Search } from "lucide-react";

const API_BASE = "";

export default function GraphParadoxPage() {
  const [activeTab, setActiveTab] = useState("detect");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Detect state
  const [timelineEvents, setTimelineEvents] = useState("event_alpha,event_beta,event_gamma,event_delta,event_epsilon");
  const [paradoxTypes, setParadoxTypes] = useState("grandfather,bootstrap,information");
  const [detectTopology, setDetectTopology] = useState("branching");
  const [detectionSensitivity, setDetectionSensitivity] = useState(0.8);
  const [maxDepth, setMaxDepth] = useState(5);

  // Resolve state
  const [paradoxId, setParadoxId] = useState("px_grandfather_0");
  const [resolutionStrategy, setResolutionStrategy] = useState("novikov");
  const [consistencyLevel, setConsistencyLevel] = useState("strict");
  const [resolveTopology, setResolveTopology] = useState("branching");
  const [maxIterations, setMaxIterations] = useState(100);
  const [tolerance, setTolerance] = useState(0.01);

  // Validate state
  const [resolvedTimeline, setResolvedTimeline] = useState("event_a,event_b,event_c,event_d");
  const [validateConsistency, setValidateConsistency] = useState("strict");
  const [verificationMethod, setVerificationMethod] = useState("formal");
  const [validateTopology, setValidateTopology] = useState("linear");
  const [sampleSize, setSampleSize] = useState(1000);

  // Repair state
  const [paradoxRegions, setParadoxRegions] = useState("region_x,region_y,region_z");
  const [repairMode, setRepairMode] = useState("surgical");
  const [repairConsistency, setRepairConsistency] = useState("strict");
  const [repairTopology, setRepairTopology] = useState("branching");
  const [repairBudget, setRepairBudget] = useState(50);

  // Branch state
  const [sourceTimeline, setSourceTimeline] = useState("timeline_prime");
  const [branchPoint, setBranchPoint] = useState("t_1970");
  const [branchTopology, setBranchTopology] = useState("branching");
  const [numBranches, setNumBranches] = useState(3);
  const [divergenceFactor, setDivergenceFactor] = useState(0.5);

  // Analyze state
  const [timelines, setTimelines] = useState("tl_alpha,tl_beta,tl_gamma,tl_delta");
  const [analyzeParadoxTypes, setAnalyzeParadoxTypes] = useState("grandfather,bootstrap,predestination,ai_novel");
  const [analyzeTopology, setAnalyzeTopology] = useState("branching");
  const [analysisDepth, setAnalysisDepth] = useState(5);
  const [crossTimeline, setCrossTimeline] = useState(true);

  const paradoxTypeOptions = ["grandfather", "bootstrap", "predestination", "ontological", "information", "ai_novel"];
  const resolutionStrategies = ["novikov", "many_worlds", "temporal_erasure", "causal_loop", "retrocausal", "ai_adaptive"];
  const consistencyLevels = ["strict", "probabilistic", "relaxed", "contextual", "dynamic", "ai_hierarchical"];
  const topologyOptions = ["linear", "branching", "cyclic", "convergent", "parallel", "ai_fractal"];
  const repairModes = ["surgical", "cascade", "rewrite", "quarantine", "merge", "ai_hybrid"];
  const verificationMethods = ["formal", "simulation", "counterexample", "model_checking", "statistical", "ai_neural"];

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-temporal-paradox/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error("Failed to fetch overview:", e);
    }
  };

  const handleSubmit = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-temporal-paradox/${endpoint}`, {
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

  const handleDetect = () => handleSubmit("detect", {
    timeline_events: timelineEvents.split(",").map(s => s.trim()),
    paradox_types: paradoxTypes.split(",").map(s => s.trim()),
    topology: detectTopology,
    detection_sensitivity: detectionSensitivity,
    max_depth: maxDepth,
  });

  const handleResolve = () => handleSubmit("resolve", {
    paradox_id: paradoxId,
    resolution_strategy: resolutionStrategy,
    consistency_level: consistencyLevel,
    topology: resolveTopology,
    max_iterations: maxIterations,
    tolerance,
  });

  const handleValidate = () => handleSubmit("validate", {
    resolved_timeline: resolvedTimeline.split(",").map(s => s.trim()),
    consistency_level: validateConsistency,
    verification_method: verificationMethod,
    topology: validateTopology,
    sample_size: sampleSize,
  });

  const handleRepair = () => handleSubmit("repair", {
    paradox_regions: paradoxRegions.split(",").map(s => s.trim()),
    repair_mode: repairMode,
    consistency_level: repairConsistency,
    topology: repairTopology,
    repair_budget: repairBudget,
  });

  const handleBranch = () => handleSubmit("branch", {
    source_timeline: sourceTimeline,
    branch_point: branchPoint,
    topology: branchTopology,
    num_branches: numBranches,
    divergence_factor: divergenceFactor,
  });

  const handleAnalyze = () => handleSubmit("analyze", {
    timelines: timelines.split(",").map(s => s.trim()),
    paradox_types: analyzeParadoxTypes.split(",").map(s => s.trim()),
    topology: analyzeTopology,
    analysis_depth: analysisDepth,
    cross_timeline: crossTimeline,
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-6 w-6 text-amber-600" />
          <h1 className="text-3xl font-bold">Causal Temporal Paradox Resolution Engine</h1>
          <Badge variant="outline">Layer 33</Badge>
        </div>
        <p className="text-muted-foreground">
          Detect, resolve, validate, and repair temporal paradoxes across the multiverse
        </p>
        {overview && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">v{overview.version}</Badge>
            <Badge variant="secondary">{overview.enums?.paradox_type?.length} Paradox Types</Badge>
            <Badge variant="secondary">{overview.configuration_space}</Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="detect">Detect</TabsTrigger>
          <TabsTrigger value="resolve">Resolve</TabsTrigger>
          <TabsTrigger value="validate">Validate</TabsTrigger>
          <TabsTrigger value="repair">Repair</TabsTrigger>
          <TabsTrigger value="branch">Branch</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
        </TabsList>

        {/* Detect Tab */}
        <TabsContent value="detect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Paradox Detection
              </CardTitle>
              <CardDescription>Detect temporal paradoxes in timeline events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Timeline Events (comma-separated)</Label>
                  <Textarea value={timelineEvents} onChange={(e) => setTimelineEvents(e.target.value)} placeholder="event_alpha,event_beta,event_gamma" />
                </div>
                <div className="col-span-2">
                  <Label>Paradox Types (comma-separated)</Label>
                  <Input value={paradoxTypes} onChange={(e) => setParadoxTypes(e.target.value)} placeholder="grandfather,bootstrap" />
                </div>
                <div>
                  <Label>Temporal Topology</Label>
                  <Select value={detectTopology} onValueChange={setDetectTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{topologyOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Detection Sensitivity ({detectionSensitivity})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={detectionSensitivity} onChange={(e) => setDetectionSensitivity(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Max Depth</Label>
                  <Input type="number" min="1" max="20" value={maxDepth} onChange={(e) => setMaxDepth(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleDetect} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Detect Paradoxes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resolve Tab */}
        <TabsContent value="resolve" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paradox Resolution
              </CardTitle>
              <CardDescription>Resolve detected temporal paradoxes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Paradox ID</Label>
                  <Input value={paradoxId} onChange={(e) => setParadoxId(e.target.value)} placeholder="px_grandfather_0" />
                </div>
                <div>
                  <Label>Resolution Strategy</Label>
                  <Select value={resolutionStrategy} onValueChange={setResolutionStrategy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{resolutionStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consistency Level</Label>
                  <Select value={consistencyLevel} onValueChange={setConsistencyLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consistencyLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temporal Topology</Label>
                  <Select value={resolveTopology} onValueChange={setResolveTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{topologyOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Max Iterations</Label>
                  <Input type="number" min="10" max="1000" value={maxIterations} onChange={(e) => setMaxIterations(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Tolerance ({tolerance})</Label>
                  <Input type="range" min="0.001" max="0.1" step="0.001" value={tolerance} onChange={(e) => setTolerance(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleResolve} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Resolve Paradox
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validate Tab */}
        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Timeline Validation
              </CardTitle>
              <CardDescription>Validate resolved timeline for causal consistency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Resolved Timeline (comma-separated events)</Label>
                  <Textarea value={resolvedTimeline} onChange={(e) => setResolvedTimeline(e.target.value)} placeholder="event_a,event_b,event_c" />
                </div>
                <div>
                  <Label>Consistency Level</Label>
                  <Select value={validateConsistency} onValueChange={setValidateConsistency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consistencyLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Verification Method</Label>
                  <Select value={verificationMethod} onValueChange={setVerificationMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{verificationMethods.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temporal Topology</Label>
                  <Select value={validateTopology} onValueChange={setValidateTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{topologyOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sample Size</Label>
                  <Input type="number" min="100" max="10000" value={sampleSize} onChange={(e) => setSampleSize(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleValidate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                Validate Timeline
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Repair Tab */}
        <TabsContent value="repair" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Causal Repair
              </CardTitle>
              <CardDescription>Repair causal paradox regions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Paradox Regions (comma-separated)</Label>
                  <Input value={paradoxRegions} onChange={(e) => setParadoxRegions(e.target.value)} placeholder="region_x,region_y,region_z" />
                </div>
                <div>
                  <Label>Repair Mode</Label>
                  <Select value={repairMode} onValueChange={setRepairMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{repairModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consistency Level</Label>
                  <Select value={repairConsistency} onValueChange={setRepairConsistency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consistencyLevels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temporal Topology</Label>
                  <Select value={repairTopology} onValueChange={setRepairTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{topologyOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Repair Budget</Label>
                  <Input type="number" min="10" max="200" value={repairBudget} onChange={(e) => setRepairBudget(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleRepair} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                Repair Regions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branch Tab */}
        <TabsContent value="branch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Temporal Branching
              </CardTitle>
              <CardDescription>Create temporal branches to isolate paradoxes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source Timeline</Label>
                  <Input value={sourceTimeline} onChange={(e) => setSourceTimeline(e.target.value)} placeholder="timeline_prime" />
                </div>
                <div>
                  <Label>Branch Point</Label>
                  <Input value={branchPoint} onChange={(e) => setBranchPoint(e.target.value)} placeholder="t_1970" />
                </div>
                <div>
                  <Label>Temporal Topology</Label>
                  <Select value={branchTopology} onValueChange={setBranchTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{topologyOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Branches</Label>
                  <Input type="number" min="1" max="10" value={numBranches} onChange={(e) => setNumBranches(parseInt(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Label>Divergence Factor ({divergenceFactor})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={divergenceFactor} onChange={(e) => setDivergenceFactor(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleBranch} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitBranch className="mr-2 h-4 w-4" />}
                Create Branches
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cross-Timeline Analysis
              </CardTitle>
              <CardDescription>Analyze cross-timeline paradox patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Timelines (comma-separated)</Label>
                  <Input value={timelines} onChange={(e) => setTimelines(e.target.value)} placeholder="tl_alpha,tl_beta,tl_gamma" />
                </div>
                <div className="col-span-2">
                  <Label>Paradox Types (comma-separated)</Label>
                  <Input value={analyzeParadoxTypes} onChange={(e) => setAnalyzeParadoxTypes(e.target.value)} placeholder="grandfather,bootstrap" />
                </div>
                <div>
                  <Label>Temporal Topology</Label>
                  <Select value={analyzeTopology} onValueChange={setAnalyzeTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{topologyOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Analysis Depth</Label>
                  <Input type="number" min="1" max="10" value={analysisDepth} onChange={(e) => setAnalysisDepth(parseInt(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Label>Cross-Timeline Analysis</Label>
                  <Select value={crossTimeline ? "true" : "false"} onValueChange={(v) => setCrossTimeline(v === "true")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
                Analyze Patterns
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