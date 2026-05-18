"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphSimulationPage() {
  const [activeTab, setActiveTab] = useState("simulation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [targetGraphId, setTargetGraphId] = useState("graph2");

  // Simulation
  const [simType, setSimType] = useState("epidemic");
  const [steps, setSteps] = useState(30);
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.1);
  const [threshold, setThreshold] = useState(0.5);
  const [diffusionCoeff, setDiffusionCoeff] = useState(0.1);
  const [restartProb, setRestartProb] = useState(0.0);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Causal
  const [causalMethod, setCausalMethod] = useState("pc");
  const [alpha, setAlpha] = useState(0.05);
  const [treatment, setTreatment] = useState(0);
  const [outcome, setOutcome] = useState(1);
  const [intervenedNode, setIntervenedNode] = useState(0);
  const [interventionValue, setInterventionValue] = useState(1.0);
  const [causalResult, setCausalResult] = useState<any>(null);

  // RL
  const [actionType, setActionType] = useState("node_select");
  const [policyType, setPolicyType] = useState("epsilon_greedy");
  const [epsilon, setEpsilon] = useState(0.1);
  const [numAgents, setNumAgents] = useState(2);
  const [cooperation, setCooperation] = useState(0.5);
  const [startNode, setStartNode] = useState(0);
  const [goalNode, setGoalNode] = useState(-1);
  const [maxSteps, setMaxSteps] = useState(50);
  const [rlResult, setRlResult] = useState<any>(null);

  const runSimulation = async (endpoint: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setSimulationResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runCausal = async (endpoint: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setCausalResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runRL = async (endpoint: string, params: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setRlResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Simulation & Causal</h1>
          <p className="text-muted-foreground">Simulation, Causal Inference & RL Operations</p>
        </div>
        <Badge variant="outline">v1.81</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="causal">Causal</TabsTrigger>
          <TabsTrigger value="rl">RL</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle>Graph Simulation Engine</CardTitle>
              <CardDescription>Run epidemic, cascade, random walk, and diffusion simulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div>
                  <Label>Simulation Type</Label>
                  <Input value={simType} onChange={(e) => setSimType(e.target.value)} />
                </div>
                <div>
                  <Label>Steps</Label>
                  <Input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Threshold</Label>
                  <Input type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => runSimulation("simulation", { sim_type: simType, steps })} disabled={loading}>
                  Run Simulation
                </Button>
                <Button onClick={() => runSimulation("simulation/epidemic", { model: "SIS", beta, gamma, steps })} disabled={loading}>
                  Epidemic
                </Button>
                <Button onClick={() => runSimulation("simulation/cascade", { threshold, steps })} disabled={loading}>
                  Cascade
                </Button>
                <Button onClick={() => runSimulation("simulation/random-walk", { steps, restart_prob: restartProb })} disabled={loading}>
                  Random Walk
                </Button>
                <Button onClick={() => runSimulation("simulation/diffusion", { diffusion_coeff: diffusionCoeff, steps })} disabled={loading}>
                  Diffusion
                </Button>
                <Button onClick={() => runSimulation("simulation/network-flow", { source_node: 0, target_node: goalNode })} disabled={loading}>
                  Network Flow
                </Button>
              </div>

              {simulationResult && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(simulationResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causal">
          <Card>
            <CardHeader>
              <CardTitle>Causal Inference</CardTitle>
              <CardDescription>Discover causal structures, estimate effects, counterfactual reasoning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div>
                  <Label>Method</Label>
                  <Input value={causalMethod} onChange={(e) => setCausalMethod(e.target.value)} />
                </div>
                <div>
                  <Label>Treatment Node</Label>
                  <Input type="number" value={treatment} onChange={(e) => setTreatment(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Outcome Node</Label>
                  <Input type="number" value={outcome} onChange={(e) => setOutcome(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Alpha</Label>
                  <Input type="number" step="0.01" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Intervened Node</Label>
                  <Input type="number" value={intervenedNode} onChange={(e) => setIntervenedNode(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => runCausal("causal/discovery", { method: causalMethod, alpha })} disabled={loading}>
                  Discovery
                </Button>
                <Button onClick={() => runCausal("causal/effect", { treatment, outcome })} disabled={loading}>
                  Effect Estimate
                </Button>
                <Button onClick={() => runCausal("causal/counterfactual", { treatment, outcome })} disabled={loading}>
                  Counterfactual
                </Button>
                <Button onClick={() => runCausal("causal/intervention", { intervened_node: intervenedNode, intervention_value: interventionValue })} disabled={loading}>
                  Intervention
                </Button>
                <Button onClick={() => runCausal("causal/strength", { source: treatment, target: outcome })} disabled={loading}>
                  Strength
                </Button>
              </div>

              {causalResult && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(causalResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rl">
          <Card>
            <CardHeader>
              <CardTitle>Reinforcement Learning</CardTitle>
              <CardDescription>Graph-based RL environments, policies, navigation agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div>
                  <Label>Action Type</Label>
                  <Input value={actionType} onChange={(e) => setActionType(e.target.value)} />
                </div>
                <div>
                  <Label>Start Node</Label>
                  <Input type="number" value={startNode} onChange={(e) => setStartNode(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Goal Node</Label>
                  <Input type="number" value={goalNode} onChange={(e) => setGoalNode(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Max Steps</Label>
                  <Input type="number" value={maxSteps} onChange={(e) => setMaxSteps(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Epsilon</Label>
                  <Input type="number" step="0.1" value={epsilon} onChange={(e) => setEpsilon(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Num Agents</Label>
                  <Input type="number" value={numAgents} onChange={(e) => setNumAgents(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Cooperation</Label>
                  <Input type="number" step="0.1" value={cooperation} onChange={(e) => setCooperation(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => runRL("rl/environment", { action_type: actionType })} disabled={loading}>
                  Environment
                </Button>
                <Button onClick={() => runRL("rl/node-selection", { policy_type: policyType, epsilon })} disabled={loading}>
                  Node Selection
                </Button>
                <Button onClick={() => runRL("rl/navigation", { start_node: startNode, goal_node: goalNode, max_steps: maxSteps })} disabled={loading}>
                  Navigation
                </Button>
                <Button onClick={() => runRL("rl/reward-shaping", { base_reward: 0 })} disabled={loading}>
                  Reward Shaping
                </Button>
                <Button onClick={() => runRL("rl/multi-agent", { num_agents: numAgents, cooperation })} disabled={loading}>
                  Multi-Agent
                </Button>
              </div>

              {rlResult && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(rlResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}