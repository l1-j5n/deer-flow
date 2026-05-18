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
import { Loader2, Users, Shield, Zap, BookOpen, Workflow, Brain } from "lucide-react";

const API_BASE = "";

export default function GraphCollectiveIntelligencePage() {
  const [activeTab, setActiveTab] = useState("swarm");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Swarm state
  const [swarmAgents, setSwarmAgents] = useState("agent_alpha,agent_beta,agent_gamma,agent_delta,agent_epsilon");
  const [collectiveStructure, setCollectiveStructure] = useState("swarm");
  const [consensusMechanism, setConsensusMechanism] = useState("deliberative");
  const [numberOfAgents, setNumberOfAgents] = useState(10);
  const [connectivity, setConnectivity] = useState(0.6);

  // Consensus state
  const [causalProposals, setCausalProposals] = useState("proposal_strong_cause,proposal_weak_cause,proposal_spurious,proposal_mediated");
  const [consensusConsensusMechanism, setConsensusConsensusMechanism] = useState("evidence");
  const [emergenceMode, setEmergenceMode] = useState("strong");
  const [numberOfRounds, setNumberOfRounds] = useState(5);
  const [convergenceThreshold, setConvergenceThreshold] = useState(0.75);

  // Emerge state
  const [agentContributions, setAgentContributions] = useState("contribution_linear,contribution_nonlinear,contribution_emergent,contribution_catalytic");
  const [emergeEmergenceMode, setEmergeEmergenceMode] = useState("synergy");
  const [socialLearning, setSocialLearning] = useState("cultural");
  const [synergyDepth, setSynergyDepth] = useState(4);
  const [diversityIndex, setDiversityIndex] = useState(0.7);

  // Learn state
  const [knowledgePool, setKnowledgePool] = useState("knowledge_domain_a,knowledge_domain_b,knowledge_domain_c,knowledge_domain_d");
  const [learnSocialLearning, setLearnSocialLearning] = useState("teaching");
  const [swarmCoordination, setSwarmCoordination] = useState("flocking");
  const [learningRate, setLearningRate] = useState(0.5);
  const [generations, setGenerations] = useState(5);

  // Coordinate state
  const [tasks, setTasks] = useState("task_causal_discovery,task_pattern_mining,task_anomaly_detection,task_hypothesis_generation");
  const [coordinateSwarmCoordination, setCoordinateSwarmCoordination] = useState("partition");
  const [coordinateCollectiveStructure, setCoordinateCollectiveStructure] = useState("federation");
  const [numberOfWorkers, setNumberOfWorkers] = useState(8);
  const [efficiencyTarget, setEfficiencyTarget] = useState(0.8);

  // Aggregate state
  const [individualJudgments, setIndividualJudgments] = useState("judgment_high_confidence,judgment_medium_confidence,judgment_low_confidence,judgment_divergent");
  const [wisdomAggregation, setWisdomAggregation] = useState("fusion");
  const [aggregateConsensusMechanism, setAggregateConsensusMechanism] = useState("reputation");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [diversityBonus, setDiversityBonus] = useState(0.3);

  const collectiveStructures = ["hierarchical", "swarm", "small_world", "scale_free", "federation", "ai_hybrid"];
  const consensusMechanisms = ["voting", "deliberative", "prediction_market", "evidence", "reputation", "ai_adaptive"];
  const emergenceModes = ["weak", "strong", "phase_transition", "synergy", "catalytic", "ai_emergence"];
  const socialLearnings = ["imitation", "teaching", "cultural", "observational", "normative", "ai_sharing"];
  const swarmCoordinations = ["stigmergy", "flocking", "partition", "collective_decision", "criticality", "ai_swarm"];
  const wisdomAggregations = ["crowd", "expert", "delphi", "fusion", "diversity", "ai_synthesis"];

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-collective-intelligence/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error("Failed to fetch overview:", e);
    }
  };

  const handleSubmit = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-collective-intelligence/${endpoint}`, {
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

  const handleSwarm = () => handleSubmit("swarm", {
    swarm_agents: swarmAgents.split(",").map(s => s.trim()),
    collective_structure: collectiveStructure,
    consensus_mechanism: consensusMechanism,
    number_of_agents: numberOfAgents,
    connectivity: connectivity,
  });

  const handleConsensus = () => handleSubmit("consensus", {
    causal_proposals: causalProposals.split(",").map(s => s.trim()),
    consensus_mechanism: consensusConsensusMechanism,
    emergence_mode: emergenceMode,
    number_of_rounds: numberOfRounds,
    convergence_threshold: convergenceThreshold,
  });

  const handleEmerge = () => handleSubmit("emerge", {
    agent_contributions: agentContributions.split(",").map(s => s.trim()),
    emergence_mode: emergeEmergenceMode,
    social_learning: socialLearning,
    synergy_depth: synergyDepth,
    diversity_index: diversityIndex,
  });

  const handleLearn = () => handleSubmit("learn", {
    knowledge_pool: knowledgePool.split(",").map(s => s.trim()),
    social_learning: learnSocialLearning,
    swarm_coordination: swarmCoordination,
    learning_rate: learningRate,
    generations: generations,
  });

  const handleCoordinate = () => handleSubmit("coordinate", {
    tasks: tasks.split(",").map(s => s.trim()),
    swarm_coordination: coordinateSwarmCoordination,
    collective_structure: coordinateCollectiveStructure,
    number_of_workers: numberOfWorkers,
    efficiency_target: efficiencyTarget,
  });

  const handleAggregate = () => handleSubmit("aggregate", {
    individual_judgments: individualJudgments.split(",").map(s => s.trim()),
    wisdom_aggregation: wisdomAggregation,
    consensus_mechanism: aggregateConsensusMechanism,
    confidence_threshold: confidenceThreshold,
    diversity_bonus: diversityBonus,
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-indigo-500" />
          <h1 className="text-3xl font-bold">Causal Collective Intelligence Engine</h1>
          <Badge variant="outline">Layer 35</Badge>
        </div>
        <p className="text-muted-foreground">
          Multi-agent causal reasoning through swarm intelligence, consensus mechanisms, and collective knowledge aggregation
        </p>
        {overview && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">v{overview.version}</Badge>
            <Badge variant="secondary">{overview.enums?.collective_structure?.length} Structures</Badge>
            <Badge variant="secondary">{overview.configuration_space}</Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="swarm">Swarm</TabsTrigger>
          <TabsTrigger value="consensus">Consensus</TabsTrigger>
          <TabsTrigger value="emerge">Emerge</TabsTrigger>
          <TabsTrigger value="learn">Learn</TabsTrigger>
          <TabsTrigger value="coordinate">Coordinate</TabsTrigger>
          <TabsTrigger value="aggregate">Aggregate</TabsTrigger>
        </TabsList>

        {/* Swarm Tab */}
        <TabsContent value="swarm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Swarm Intelligence
              </CardTitle>
              <CardDescription>Initialize and configure causal reasoning swarm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Swarm Agents (comma-separated)</Label>
                  <Textarea value={swarmAgents} onChange={(e) => setSwarmAgents(e.target.value)} placeholder="agent_alpha,agent_beta" />
                </div>
                <div>
                  <Label>Collective Structure</Label>
                  <Select value={collectiveStructure} onValueChange={setCollectiveStructure}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{collectiveStructures.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consensus Mechanism</Label>
                  <Select value={consensusMechanism} onValueChange={setConsensusMechanism}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consensusMechanisms.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Agents</Label>
                  <Input type="number" min="2" max="50" value={numberOfAgents} onChange={(e) => setNumberOfAgents(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Connectivity ({connectivity})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={connectivity} onChange={(e) => setConnectivity(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleSwarm} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                Initialize Swarm
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consensus Tab */}
        <TabsContent value="consensus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consensus Building
              </CardTitle>
              <CardDescription>Build consensus on causal proposals through collective deliberation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Causal Proposals (comma-separated)</Label>
                  <Textarea value={causalProposals} onChange={(e) => setCausalProposals(e.target.value)} placeholder="proposal_a,proposal_b" />
                </div>
                <div>
                  <Label>Consensus Mechanism</Label>
                  <Select value={consensusConsensusMechanism} onValueChange={setConsensusConsensusMechanism}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consensusMechanisms.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Emergence Mode</Label>
                  <Select value={emergenceMode} onValueChange={setEmergenceMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{emergenceModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Rounds</Label>
                  <Input type="number" min="1" max="20" value={numberOfRounds} onChange={(e) => setNumberOfRounds(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Convergence Threshold ({convergenceThreshold})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={convergenceThreshold} onChange={(e) => setConvergenceThreshold(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleConsensus} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Build Consensus
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emerge Tab */}
        <TabsContent value="emerge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Emergence Detection
              </CardTitle>
              <CardDescription>Detect emergent properties from agent interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Agent Contributions (comma-separated)</Label>
                  <Textarea value={agentContributions} onChange={(e) => setAgentContributions(e.target.value)} placeholder="contribution_a,contribution_b" />
                </div>
                <div>
                  <Label>Emergence Mode</Label>
                  <Select value={emergeEmergenceMode} onValueChange={setEmergeEmergenceMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{emergenceModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Social Learning</Label>
                  <Select value={socialLearning} onValueChange={setSocialLearning}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{socialLearnings.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Synergy Depth</Label>
                  <Input type="number" min="1" max="10" value={synergyDepth} onChange={(e) => setSynergyDepth(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Diversity Index ({diversityIndex})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={diversityIndex} onChange={(e) => setDiversityIndex(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleEmerge} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Detect Emergence
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learn Tab */}
        <TabsContent value="learn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Collective Learning
              </CardTitle>
              <CardDescription>Enable social learning across agent populations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Knowledge Pool (comma-separated)</Label>
                  <Textarea value={knowledgePool} onChange={(e) => setKnowledgePool(e.target.value)} placeholder="knowledge_domain_a,knowledge_domain_b" />
                </div>
                <div>
                  <Label>Social Learning</Label>
                  <Select value={learnSocialLearning} onValueChange={setLearnSocialLearning}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{socialLearnings.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Swarm Coordination</Label>
                  <Select value={swarmCoordination} onValueChange={setSwarmCoordination}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{swarmCoordinations.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Learning Rate ({learningRate})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Generations</Label>
                  <Input type="number" min="1" max="20" value={generations} onChange={(e) => setGenerations(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleLearn} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                Start Learning
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coordinate Tab */}
        <TabsContent value="coordinate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Task Coordination
              </CardTitle>
              <CardDescription>Coordinate collective causal reasoning tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tasks (comma-separated)</Label>
                  <Textarea value={tasks} onChange={(e) => setTasks(e.target.value)} placeholder="task_a,task_b,task_c" />
                </div>
                <div>
                  <Label>Swarm Coordination</Label>
                  <Select value={coordinateSwarmCoordination} onValueChange={setCoordinateSwarmCoordination}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{swarmCoordinations.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Collective Structure</Label>
                  <Select value={coordinateCollectiveStructure} onValueChange={setCoordinateCollectiveStructure}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{collectiveStructures.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Workers</Label>
                  <Input type="number" min="2" max="50" value={numberOfWorkers} onChange={(e) => setNumberOfWorkers(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Efficiency Target ({efficiencyTarget})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={efficiencyTarget} onChange={(e) => setEfficiencyTarget(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleCoordinate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Workflow className="mr-2 h-4 w-4" />}
                Coordinate Tasks
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aggregate Tab */}
        <TabsContent value="aggregate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Wisdom Aggregation
              </CardTitle>
              <CardDescription>Aggregate individual judgments into collective wisdom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Individual Judgments (comma-separated)</Label>
                  <Textarea value={individualJudgments} onChange={(e) => setIndividualJudgments(e.target.value)} placeholder="judgment_a,judgment_b" />
                </div>
                <div>
                  <Label>Wisdom Aggregation</Label>
                  <Select value={wisdomAggregation} onValueChange={setWisdomAggregation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{wisdomAggregations.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consensus Mechanism</Label>
                  <Select value={aggregateConsensusMechanism} onValueChange={setAggregateConsensusMechanism}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consensusMechanisms.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Confidence Threshold ({confidenceThreshold})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Diversity Bonus ({diversityBonus})</Label>
                  <Input type="range" min="0.0" max="1.0" step="0.1" value={diversityBonus} onChange={(e) => setDiversityBonus(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleAggregate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                Aggregate Wisdom
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
