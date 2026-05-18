"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Flame, Thermometer, Zap, Waves, Scale, Wind, BarChart3 } from "lucide-react";

const API_BASE = "";

export default function CausalThermodynamicPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Entropy state — 熵计算
  const [entropyType, setEntropyType] = useState("shannon_entropy");
  const [numVariables, setNumVariables] = useState(12);
  const [resolution, setResolution] = useState(50);
  const [temperature, setTemperature] = useState(1.0);

  // Potential state — 热力学势
  const [potentialType, setPotentialType] = useState("helmholtz_free_energy");
  const [numStates, setNumStates] = useState(20);
  const [tempRange, setTempRange] = useState(2.0);
  const [externalField, setExternalField] = useState(0.0);

  // Phase state — 相变检测
  const [transitionType, setTransitionType] = useState("second_order");
  const [criticalTemp, setCriticalTemp] = useState(1.0);
  const [sweepRange, setSweepRange] = useState(0.5);
  const [orderParam, setOrderParam] = useState(1.0);

  // Fluctuation state — 涨落测量
  const [fluctMode, setFluctMode] = useState("thermal");
  const [numObservables, setNumObservables] = useState(8);
  const [timeSteps, setTimeSteps] = useState(100);
  const [corrLength, setCorrLength] = useState(1.0);

  // Equilibrium state — 平衡态
  const [eqStateType, setEqStateType] = useState("local_equilibrium");
  const [numSpecies, setNumSpecies] = useState(6);
  const [relaxSteps, setRelaxSteps] = useState(50);
  const [damping, setDamping] = useState(0.1);

  // Transport state — 输运过程
  const [transportProcess, setTransportProcess] = useState("diffusion");
  const [numParticles, setNumParticles] = useState(100);
  const [spatialDims, setSpatialDims] = useState(3);
  const [gradientStr, setGradientStr] = useState(1.0);

  const entropyTypes = [
    { value: "shannon_entropy", label: "Shannon" },
    { value: "von_neumann_entropy", label: "Von Neumann" },
    { value: "tsallis_entropy", label: "Tsallis" },
    { value: "renyi_entropy", label: "Rényi" },
    { value: "fisher_information", label: "Fisher" },
    { value: "ai_entropy", label: "AI Adaptive" },
  ];
  const potentialTypes = [
    { value: "helmholtz_free_energy", label: "Helmholtz F" },
    { value: "gibbs_free_energy", label: "Gibbs G" },
    { value: "enthalpy", label: "Enthalpy H" },
    { value: "internal_energy", label: "Internal U" },
    { value: "grand_potential", label: "Grand Ω" },
    { value: "ai_potential", label: "AI Adaptive" },
  ];
  const transitionTypes = [
    { value: "first_order", label: "First Order" },
    { value: "second_order", label: "Second Order" },
    { value: "continuous", label: "Continuous" },
    { value: "topological", label: "Topological" },
    { value: "quantum", label: "Quantum" },
    { value: "ai_transition", label: "AI Adaptive" },
  ];
  const fluctModes = [
    { value: "thermal", label: "Thermal" },
    { value: "quantum", label: "Quantum" },
    { value: "critical", label: "Critical" },
    { value: "stochastic", label: "Stochastic" },
    { value: "correlated", label: "Correlated" },
    { value: "ai_fluctuation", label: "AI Adaptive" },
  ];
  const eqStateTypes = [
    { value: "global_equilibrium", label: "Global" },
    { value: "local_equilibrium", label: "Local" },
    { value: "metastable", label: "Metastable" },
    { value: "nonequilibrium", label: "Non-Eq" },
    { value: "steady_state", label: "Steady" },
    { value: "ai_equilibrium", label: "AI Adaptive" },
  ];
  const transportTypes = [
    { value: "diffusion", label: "Diffusion" },
    { value: "conduction", label: "Conduction" },
    { value: "convection", label: "Convection" },
    { value: "radiation", label: "Radiation" },
    { value: "viscous_flow", label: "Viscous Flow" },
    { value: "ai_transport", label: "AI Adaptive" },
  ];

  const callAPI = async (endpoint: string, body: any) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-thermodynamic/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setResults({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-thermodynamic/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e: any) {
      setOverview({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const renderBar = (label: string, value: number, max: number, color = "bg-blue-500") => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{typeof value === "number" ? value.toFixed(4) : value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );

  const renderMiniBar = (values: number[], color = "bg-indigo-500") => (
    <div className="flex items-end gap-[2px] h-16">
      {values.map((v, i) => {
        const maxV = Math.max(...values.map(Math.abs)) || 1;
        return <div key={i} className={`flex-1 ${color} rounded-t-sm transition-all`} style={{ height: `${(Math.abs(v) / maxV) * 100}%` }} />;
      })}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="w-8 h-8 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Causal Thermodynamic Engine</h1>
          <p className="text-muted-foreground text-sm">因果热力学与熵动力分析引擎 · Layer 43 · v1.291</p>
        </div>
        <Badge variant="secondary" className="ml-auto">6⁶ = 46,656 configs</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs"><BarChart3 className="w-3 h-3 mr-1" />Overview</TabsTrigger>
          <TabsTrigger value="entropy" className="text-xs"><Flame className="w-3 h-3 mr-1" />Entropy</TabsTrigger>
          <TabsTrigger value="potential" className="text-xs"><Thermometer className="w-3 h-3 mr-1" />Potential</TabsTrigger>
          <TabsTrigger value="phase" className="text-xs"><Zap className="w-3 h-3 mr-1" />Phase</TabsTrigger>
          <TabsTrigger value="fluctuation" className="text-xs"><Waves className="w-3 h-3 mr-1" />Fluctuation</TabsTrigger>
          <TabsTrigger value="equilibrium" className="text-xs"><Scale className="w-3 h-3 mr-1" />Equilibrium</TabsTrigger>
          <TabsTrigger value="transport" className="text-xs"><Wind className="w-3 h-3 mr-1" />Transport</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>System Overview</CardTitle><CardDescription>Engine metadata, enums, and endpoint inventory</CardDescription></CardHeader>
            <CardContent>
              <Button onClick={fetchOverview} disabled={loading} className="mb-4">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BarChart3 className="w-4 h-4 mr-2" />}Fetch Overview
              </Button>
              {overview && !overview.error && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Layer</div><div className="text-xl font-bold">{overview.layer}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Version</div><div className="text-xl font-bold">{overview.version}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Config Space</div><div className="text-xl font-bold">{overview.config_space?.toLocaleString()}</div></Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {overview.enums && Object.entries(overview.enums).map(([name, values]: [string, any]) => (
                      <div key={name} className="border rounded-lg p-3">
                        <div className="font-semibold text-sm mb-2">{name}</div>
                        <div className="flex flex-wrap gap-1">{values.map((v: string) => <Badge key={v} variant="outline" className="text-xs">{v}</Badge>)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="font-semibold text-sm mb-2">Endpoints ({overview.endpoints?.length})</div>
                    {overview.endpoints?.map((ep: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 py-1 text-sm">
                        <Badge variant={ep.method === "GET" ? "secondary" : "default"} className="text-xs w-12 justify-center">{ep.method}</Badge>
                        <code className="text-xs">{ep.path}</code>
                        <span className="text-muted-foreground text-xs">— {ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entropy Tab */}
        <TabsContent value="entropy">
          <Card>
            <CardHeader><CardTitle>Entropy Computation</CardTitle><CardDescription>Compute information-theoretic entropy for causal structures</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Entropy Type</Label><Select value={entropyType} onValueChange={setEntropyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{entropyTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Variables</Label><Input type="number" value={numVariables} onChange={e => setNumVariables(+e.target.value)} min={2} max={100} /></div>
                <div><Label>Resolution</Label><Input type="number" value={resolution} onChange={e => setResolution(+e.target.value)} min={10} max={200} /></div>
                <div><Label>Temperature</Label><Input type="number" value={temperature} onChange={e => setTemperature(+e.target.value)} min={0.01} max={100} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("entropy", { entropy_type: entropyType, num_variables: numVariables, resolution, temperature, coupling_strength: 0.5 })} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Flame className="w-4 h-4 mr-2" />}Compute Entropy
              </Button>
              {results && !results.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Total Entropy</div><div className="text-lg font-bold">{results.total_entropy?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Max Entropy</div><div className="text-lg font-bold">{results.max_entropy?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Normalized</div><div className="text-lg font-bold">{results.normalized_entropy?.toFixed(4)}</div></Card>
                  </div>
                  {renderBar("Entropy Rate", results.entropy_rate || 0, 5, "bg-orange-500")}
                  <div><div className="text-xs text-muted-foreground mb-1">Entropy Profile</div>{renderMiniBar(results.entropy_profile?.slice(0, 30) || [], "bg-orange-400")}</div>
                  <div><div className="text-xs text-muted-foreground mb-1">Mutual Information</div>
                    <div className="flex gap-1">{(results.mutual_information || []).map((v: number, i: number) => <Badge key={i} variant="outline">{v.toFixed(4)}</Badge>)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Potential Tab */}
        <TabsContent value="potential">
          <Card>
            <CardHeader><CardTitle>Thermodynamic Potential Analysis</CardTitle><CardDescription>Analyze free energy landscapes and thermodynamic potentials</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Potential Type</Label><Select value={potentialType} onValueChange={setPotentialType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{potentialTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>States</Label><Input type="number" value={numStates} onChange={e => setNumStates(+e.target.value)} min={5} max={100} /></div>
                <div><Label>Temp Range</Label><Input type="number" value={tempRange} onChange={e => setTempRange(+e.target.value)} min={0.1} max={10} step={0.1} /></div>
                <div><Label>External Field</Label><Input type="number" value={externalField} onChange={e => setExternalField(+e.target.value)} min={-5} max={5} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("potential", { potential_type: potentialType, num_states: numStates, temperature_range: tempRange, num_observations: 40, external_field: externalField })} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Thermometer className="w-4 h-4 mr-2" />}Analyze Potential
              </Button>
              {results && !results.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Min Potential</div><div className="text-lg font-bold">{results.minimum_potential?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Min Temperature</div><div className="text-lg font-bold">{results.minimum_temperature?.toFixed(4)}</div></Card>
                  </div>
                  <div><div className="text-xs text-muted-foreground mb-1">Potential Landscape</div>{renderMiniBar(results.potential_values?.slice(0, 40) || [], "bg-red-400")}</div>
                  <div><div className="text-xs text-muted-foreground mb-1">Gradients</div>{renderMiniBar(results.gradients?.slice(0, 30) || [], "bg-red-300")}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase Tab */}
        <TabsContent value="phase">
          <Card>
            <CardHeader><CardTitle>Phase Transition Detection</CardTitle><CardDescription>Detect and classify phase transitions in causal structures</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Transition Type</Label><Select value={transitionType} onValueChange={setTransitionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{transitionTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Critical Temp</Label><Input type="number" value={criticalTemp} onChange={e => setCriticalTemp(+e.target.value)} min={0.01} max={10} step={0.1} /></div>
                <div><Label>Sweep Range</Label><Input type="number" value={sweepRange} onChange={e => setSweepRange(+e.target.value)} min={0.01} max={5} step={0.1} /></div>
                <div><Label>Order Param</Label><Input type="number" value={orderParam} onChange={e => setOrderParam(+e.target.value)} min={0} max={5} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("phase", { transition_type: transitionType, num_samples: 50, critical_temp: criticalTemp, sweep_range: sweepRange, order_parameter: orderParam })} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}Detect Phase
              </Button>
              {results && !results.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Critical Temp</div><div className="text-lg font-bold">{results.critical_temperature}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Latent Heat</div><div className="text-lg font-bold">{results.latent_heat?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Universality</div><div className="text-lg font-bold text-sm">{results.universality_class}</div></Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-xs text-muted-foreground mb-1">Order Parameters</div>{renderMiniBar(results.order_parameters?.slice(0, 40) || [], "bg-yellow-400")}</div>
                    <div><div className="text-xs text-muted-foreground mb-1">Susceptibility</div>{renderMiniBar(results.susceptibility?.slice(0, 40) || [], "bg-yellow-300")}</div>
                  </div>
                  {results.critical_exponents && (
                    <div className="border rounded-lg p-3">
                      <div className="font-semibold text-sm mb-2">Critical Exponents</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(results.critical_exponents).map(([k, v]: [string, any]) => (
                          <Badge key={k} variant="outline" className="text-xs">{k} = {v}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluctuation Tab */}
        <TabsContent value="fluctuation">
          <Card>
            <CardHeader><CardTitle>Fluctuation Measurement</CardTitle><CardDescription>Measure thermal and quantum fluctuations in causal observables</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Mode</Label><Select value={fluctMode} onValueChange={setFluctMode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{fluctModes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Observables</Label><Input type="number" value={numObservables} onChange={e => setNumObservables(+e.target.value)} min={2} max={50} /></div>
                <div><Label>Time Steps</Label><Input type="number" value={timeSteps} onChange={e => setTimeSteps(+e.target.value)} min={20} max={500} /></div>
                <div><Label>Corr Length</Label><Input type="number" value={corrLength} onChange={e => setCorrLength(+e.target.value)} min={0.1} max={10} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("fluctuation", { mode: fluctMode, num_observables: numObservables, time_steps: timeSteps, variance_scale: 1.0, correlation_length: corrLength })} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Waves className="w-4 h-4 mr-2" />}Measure Fluctuations
              </Button>
              {results && !results.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Dissipation Coeff</div><div className="text-lg font-bold">{results.dissipation_coefficient?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">FDT Ratio</div><div className="text-lg font-bold">{results.fluctuation_dissipation_ratio?.toFixed(4)}</div></Card>
                  </div>
                  <div><div className="text-xs text-muted-foreground mb-1">Variances</div>
                    <div className="flex gap-1 flex-wrap">{(results.variances || []).map((v: number, i: number) => <Badge key={i} variant="outline" className="text-xs">O{i}: {v.toFixed(4)}</Badge>)}</div>
                  </div>
                  <div><div className="text-xs text-muted-foreground mb-1">Spectral Density</div>{renderMiniBar(results.spectral_density || [], "bg-purple-400")}</div>
                  <div><div className="text-xs text-muted-foreground mb-1">Response Functions</div>{renderMiniBar(results.response_functions || [], "bg-purple-300")}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equilibrium Tab */}
        <TabsContent value="equilibrium">
          <Card>
            <CardHeader><CardTitle>Equilibrium State Analysis</CardTitle><CardDescription>Analyze equilibrium states and relaxation dynamics</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>State Type</Label><Select value={eqStateType} onValueChange={setEqStateType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{eqStateTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Species</Label><Input type="number" value={numSpecies} onChange={e => setNumSpecies(+e.target.value)} min={2} max={20} /></div>
                <div><Label>Relax Steps</Label><Input type="number" value={relaxSteps} onChange={e => setRelaxSteps(+e.target.value)} min={10} max={200} /></div>
                <div><Label>Damping</Label><Input type="number" value={damping} onChange={e => setDamping(+e.target.value)} min={0.001} max={1} step={0.01} /></div>
              </div>
              <Button onClick={() => callAPI("equilibrate", { state_type: eqStateType, num_species: numSpecies, relaxation_steps: relaxSteps, damping, constraint_count: 3 })} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Scale className="w-4 h-4 mr-2" />}Analyze Equilibrium
              </Button>
              {results && !results.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Converged</div><div className="text-lg font-bold">{results.converged ? "✓ Yes" : "✗ No"}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Final Residual</div><div className="text-lg font-bold">{results.final_residual?.toExponential(3)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Relaxation τ</div><div className="text-lg font-bold">{results.relaxation_time?.toFixed(4)}</div></Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-xs text-muted-foreground mb-1">Convergence Curve</div>{renderMiniBar(results.convergence_curve?.slice(0, 40) || [], "bg-green-400")}</div>
                    <div><div className="text-xs text-muted-foreground mb-1">Free Energy Evolution</div>{renderMiniBar(results.free_energy_evolution?.slice(0, 40) || [], "bg-green-300")}</div>
                  </div>
                  <div><div className="text-xs text-muted-foreground mb-1">Chemical Potentials</div>
                    <div className="flex gap-1 flex-wrap">{(results.chemical_potentials || []).map((v: number, i: number) => <Badge key={i} variant="outline" className="text-xs">μ{i}: {v.toFixed(4)}</Badge>)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transport Tab */}
        <TabsContent value="transport">
          <Card>
            <CardHeader><CardTitle>Transport Process Analysis</CardTitle><CardDescription>Analyze diffusion, conduction, and transport phenomena</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Process</Label><Select value={transportProcess} onValueChange={setTransportProcess}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{transportTypes.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Particles</Label><Input type="number" value={numParticles} onChange={e => setNumParticles(+e.target.value)} min={10} max={1000} /></div>
                <div><Label>Spatial Dims</Label><Input type="number" value={spatialDims} onChange={e => setSpatialDims(+e.target.value)} min={1} max={6} /></div>
                <div><Label>Gradient</Label><Input type="number" value={gradientStr} onChange={e => setGradientStr(+e.target.value)} min={0.01} max={10} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("transport", { process: transportProcess, num_particles: numParticles, spatial_dims: spatialDims, num_steps: 80, gradient_strength: gradientStr })} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wind className="w-4 h-4 mr-2" />}Analyze Transport
              </Button>
              {results && !results.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Diffusion Coeff</div><div className="text-lg font-bold">{results.diffusion_coefficient?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Conductivity</div><div className="text-lg font-bold">{results.conductivity?.toFixed(4)}</div></Card>
                    <Card className="p-3"><div className="text-xs text-muted-foreground">Péclet Number</div><div className="text-lg font-bold">{results.péclet_number?.toFixed(4)}</div></Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-xs text-muted-foreground mb-1">Mean Square Displacement</div>{renderMiniBar(results.mean_square_displacement?.slice(0, 40) || [], "bg-cyan-400")}</div>
                    <div><div className="text-xs text-muted-foreground mb-1">Current Density</div>{renderMiniBar(results.current_density || [], "bg-cyan-300")}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-xs text-muted-foreground mb-1">Mobility</div><span className="font-mono">{results.mobility?.toFixed(4)}</span></div>
                    <div><div className="text-xs text-muted-foreground mb-1">Onsager Ratio</div>{renderMiniBar(results.onsager_ratio || [], "bg-teal-400")}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
