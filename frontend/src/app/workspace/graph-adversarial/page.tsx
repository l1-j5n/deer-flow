"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphAdversarialPage() {
  const [activeTab, setActiveTab] = useState("attack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Attack
  const [attackType, setAttackType] = useState("fgsm");
  const [epsilon, setEpsilon] = useState(0.1);
  const [budget, setBudget] = useState(10);
  const [targetNode, setTargetNode] = useState(0);
  const [numInjected, setNumInjected] = useState(5);
  const [injectionStrategy, setInjectionStrategy] = useState("random");
  const [numAdd, setNumAdd] = useState(5);
  const [numRemove, setNumRemove] = useState(5);
  const [perturbRatio, setPerturbRatio] = useState(0.1);
  const [perturbMagnitude, setPerturbMagnitude] = useState(0.5);
  const [attackStrength, setAttackStrength] = useState(0.3);
  const [attackResult, setAttackResult] = useState<any>(null);

  // Defense
  const [defenseType, setDefenseType] = useState("adversarial_training");
  const [defenseStrength, setDefenseStrength] = useState(0.8);
  const [purificationMethod, setPurificationMethod] = useState("jaccard");
  const [threshold, setThreshold] = useState(0.5);
  const [aggregator, setAggregator] = useState("trimmed_mean");
  const [trimRatio, setTrimRatio] = useState(0.1);
  const [certMethod, setCertMethod] = useState("randomized_smoothing");
  const [numSamples, setNumSamples] = useState(100);
  const [defenseResult, setDefenseResult] = useState<any>(null);

  // Robustness
  const [perturbType, setPerturbType] = useState("add_edge");
  const [perturbBudget, setPerturbBudget] = useState(10);
  const [detectionMethod, setDetectionMethod] = useState("graph_saliency");
  const [topK, setTopK] = useState(10);
  const [intensityLevels, setIntensityLevels] = useState(5);
  const [metric, setMetric] = useState("accuracy");
  const [sourceAttack, setSourceAttack] = useState("fgsm");
  const [targetModels, setTargetModels] = useState(3);
  const [robustnessResult, setRobustnessResult] = useState<any>(null);

  const runAttack = async (endpoint: string, params: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setAttackResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runDefense = async (endpoint: string, params: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setDefenseResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runRobustness = async (endpoint: string, params: any) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setRobustnessResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Adversarial Robustness</h1>
          <p className="text-muted-foreground">Attack, Defense & Robustness Analysis</p>
        </div>
        <Badge variant="outline">v1.82</Badge>
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
          <TabsTrigger value="attack">Adversarial Attack</TabsTrigger>
          <TabsTrigger value="defense">Defense</TabsTrigger>
          <TabsTrigger value="robustness">Robustness</TabsTrigger>
        </TabsList>

        <TabsContent value="attack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adversarial Attacks</CardTitle>
              <CardDescription>FGSM, PGD, DeepFool, Random, NetAttack & More</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Attack Type</Label>
                  <Input value={attackType} onChange={(e) => setAttackType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Epsilon</Label>
                  <Input type="number" step="0.01" value={epsilon} onChange={(e) => setEpsilon(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runAttack("adversarial/attack", { attack_type: attackType, epsilon, budget, target_node: targetNode })} disabled={loading}>
                  Standard Attack
                </Button>
                <Button onClick={() => runAttack("adversarial/attack/node-injection", { num_injected: numInjected, injection_strategy: injectionStrategy })} disabled={loading}>
                  Node Injection
                </Button>
                <Button onClick={() => runAttack("adversarial/attack/edge-manipulation", { num_add: numAdd, num_remove: numRemove })} disabled={loading}>
                  Edge Manipulation
                </Button>
                <Button onClick={() => runAttack("adversarial/attack/feature-perturbation", { perturb_ratio: perturbRatio, perturb_magnitude: perturbMagnitude })} disabled={loading}>
                  Feature Perturbation
                </Button>
                <Button onClick={() => runAttack("adversarial/attack/untargeted", { attack_strength: attackStrength, max_perturbations: budget })} disabled={loading}>
                  Untargeted
                </Button>
              </div>
              {attackResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto">{JSON.stringify(attackResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adversarial Defense</CardTitle>
              <CardDescription>Adversarial Training, Purification, Robust Aggregation & Certification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Defense Type</Label>
                  <Input value={defenseType} onChange={(e) => setDefenseType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Strength</Label>
                  <Input type="number" step="0.1" value={defenseStrength} onChange={(e) => setDefenseStrength(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runDefense("adversarial/defense", { defense_type: defenseType, strength: defenseStrength, attack_budget: budget })} disabled={loading}>
                  Standard Defense
                </Button>
                <Button onClick={() => runDefense("adversarial/defense/purification", { purification_method: purificationMethod, threshold })} disabled={loading}>
                  Purification
                </Button>
                <Button onClick={() => runDefense("adversarial/defense/robust-aggregation", { aggregator, trim_ratio: trimRatio })} disabled={loading}>
                  Robust Aggregation
                </Button>
                <Button onClick={() => runDefense("adversarial/defense/certification", { certification_method: certMethod, num_samples: numSamples })} disabled={loading}>
                  Certification
                </Button>
              </div>
              {defenseResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto">{JSON.stringify(defenseResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robustness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Robustness Analysis</CardTitle>
              <CardDescription>Analysis, Vulnerability Detection, Perturbation Testing & Transferability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Perturb Type</Label>
                  <Input value={perturbType} onChange={(e) => setPerturbType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Perturb Budget</Label>
                  <Input type="number" value={perturbBudget} onChange={(e) => setPerturbBudget(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Top K</Label>
                  <Input type="number" value={topK} onChange={(e) => setTopK(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runRobustness("robustness/analysis", { perturb_type: perturbType, perturb_budget: perturbBudget })} disabled={loading}>
                  Robustness Analysis
                </Button>
                <Button onClick={() => runRobustness("robustness/vulnerability", { detection_method: detectionMethod, top_k: topK })} disabled={loading}>
                  Vulnerability Detection
                </Button>
                <Button onClick={() => runRobustness("robustness/perturbation-test", { perturb_type: perturbType, intensity_levels: intensityLevels, metric })} disabled={loading}>
                  Perturbation Test
                </Button>
                <Button onClick={() => runRobustness("robustness/transferability", { source_attack: sourceAttack, target_models: targetModels })} disabled={loading}>
                  Transferability
                </Button>
              </div>
              {robustnessResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto">{JSON.stringify(robustnessResult, null, 2)}</pre>
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
