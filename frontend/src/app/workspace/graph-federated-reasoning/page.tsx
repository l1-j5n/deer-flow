"use client";

import { useState } from "react";

// Enums mirror backend
const PARTITION_METHODS = ["spectral", "random", "community", "hash", "topology_aware", "adaptive"];
const PRIVACY_LEVELS = ["none", "local_dp", "global_dp", "cd_dp", "secure_aggregation", "tee"];
const AGGREGATION_METHODS = ["fedavg", "fedprox", "scaffold", "moon", "fednova", "personalize"];
const COMPRESS_METHODS = ["topk", "randomk", "quantization", "sparsification", "hadamard", "none"];
const CLIENT_TYPES = ["high_resource", "medium_resource", "low_resource", "edge", "mobile", "iot"];
const REASONING_TYPES = ["inductive", "transductive", "inductive_transductive", "few_shot", "zero_shot", "meta_reasoning"];

const TABS = [
  { id: "partition", label: "Partition", icon: "✂️" },
  { id: "privacy", label: "Privacy", icon: "🔒" },
  { id: "aggregate", label: "Aggregate", icon: "🔗" },
  { id: "communicate", label: "Comms", icon: "📡" },
  { id: "heterogeneous", label: "Hetero", icon: "🔀" },
  { id: "pipeline", label: "Pipeline", icon: "⚡" },
  { id: "summary", label: "Summary", icon: "📊" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ApiResult {
  [key: string]: unknown;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <select
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 10000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <input
        type="number"
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
      />
    </div>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-green-400 overflow-auto max-h-[600px] font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function GraphFederatedReasoningPage() {
  const [tab, setTab] = useState<TabId>("partition");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  // Partition params
  const [graphId, setGraphId] = useState("graph_001");
  const [partitionMethod, setPartitionMethod] = useState("spectral");
  const [numClients, setNumClients] = useState(5);
  const [overlapRatio, setOverlapRatio] = useState(0.1);

  // Privacy params
  const [privacyLevel, setPrivacyLevel] = useState("local_dp");
  const [epsilon, setEpsilon] = useState(1.0);
  const [delta, setDelta] = useState(1e-5);
  const [reasoningType, setReasoningType] = useState("inductive");
  const [numRounds, setNumRounds] = useState(10);
  const [sensitivity, setSensitivity] = useState(1.0);

  // Aggregate params
  const [aggregationMethod, setAggregationMethod] = useState("fedavg");
  const [participationRate, setParticipationRate] = useState(0.8);

  // Communicate params
  const [compressMethod, setCompressMethod] = useState("topk");
  const [bandwidthLimit, setBandwidthLimit] = useState(100.0);
  const [messageSize, setMessageSize] = useState(10.0);
  const [latency, setLatency] = useState(50.0);

  // Heterogeneous params
  const [clientDistribution, setClientDistribution] = useState("non_iid_label");
  const [dataHeterogeneity, setDataHeterogeneity] = useState(0.5);
  const [resourceVariance, setResourceVariance] = useState(0.3);

  // Pipeline params
  const [privacyBudget, setPrivacyBudget] = useState(10.0);
  const [targetAccuracy, setTargetAccuracy] = useState(0.85);
  const [totalRounds, setTotalRounds] = useState(50);

  const API = "/api/kg";

  async function callApi(path: string, body: Record<string, unknown>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (err: unknown) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/fed-reason/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (err: unknown) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  function renderControls() {
    switch (tab) {
      case "partition":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Graph ID</label>
              <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            </div>
            <SelectField label="Partition Method" value={partitionMethod} options={PARTITION_METHODS} onChange={setPartitionMethod} />
            <NumberField label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
            <NumberField label="Overlap Ratio" value={overlapRatio} onChange={setOverlapRatio} step={0.05} min={0} max={0.5} />
          </div>
        );
      case "privacy":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Graph ID</label>
              <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            </div>
            <SelectField label="Privacy Level" value={privacyLevel} options={PRIVACY_LEVELS} onChange={setPrivacyLevel} />
            <NumberField label="Epsilon" value={epsilon} onChange={setEpsilon} step={0.1} min={0.01} max={100} />
            <NumberField label="Delta" value={delta} onChange={setDelta} step={1e-6} min={1e-8} max={1} />
            <SelectField label="Reasoning Type" value={reasoningType} options={REASONING_TYPES} onChange={setReasoningType} />
            <NumberField label="Num Rounds" value={numRounds} onChange={setNumRounds} min={1} max={1000} />
            <NumberField label="Sensitivity" value={sensitivity} onChange={setSensitivity} step={0.1} min={0.01} max={100} />
          </div>
        );
      case "aggregate":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Graph ID</label>
              <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            </div>
            <SelectField label="Aggregation" value={aggregationMethod} options={AGGREGATION_METHODS} onChange={setAggregationMethod} />
            <NumberField label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
            <NumberField label="Num Rounds" value={numRounds} onChange={setNumRounds} min={1} max={1000} />
            <NumberField label="Participation Rate" value={participationRate} onChange={setParticipationRate} step={0.05} min={0.1} max={1.0} />
          </div>
        );
      case "communicate":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Graph ID</label>
              <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            </div>
            <SelectField label="Compression" value={compressMethod} options={COMPRESS_METHODS} onChange={setCompressMethod} />
            <NumberField label="Bandwidth (Mbps)" value={bandwidthLimit} onChange={setBandwidthLimit} step={10} min={0.1} max={10000} />
            <NumberField label="Num Rounds" value={numRounds} onChange={setNumRounds} min={1} max={1000} />
            <NumberField label="Message Size (MB)" value={messageSize} onChange={setMessageSize} step={1} min={0.1} max={10000} />
            <NumberField label="Latency (ms)" value={latency} onChange={setLatency} step={5} min={0} max={5000} />
          </div>
        );
      case "heterogeneous":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Graph ID</label>
              <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            </div>
            <NumberField label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
            <SelectField label="Distribution" value={clientDistribution} options={["iid", "non_iid_label", "non_iid_quantity", "non_iid_feature", "realistic"]} onChange={setClientDistribution} />
            <NumberField label="Data Heterogeneity" value={dataHeterogeneity} onChange={setDataHeterogeneity} step={0.05} min={0} max={1} />
            <NumberField label="Resource Variance" value={resourceVariance} onChange={setResourceVariance} step={0.05} min={0} max={1} />
          </div>
        );
      case "pipeline":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-medium">Graph ID</label>
              <input className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            </div>
            <NumberField label="Total Rounds" value={totalRounds} onChange={setTotalRounds} min={1} max={10000} />
            <NumberField label="Privacy Budget" value={privacyBudget} onChange={setPrivacyBudget} step={0.5} min={0.1} max={1000} />
            <NumberField label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
            <NumberField label="Target Accuracy" value={targetAccuracy} onChange={setTargetAccuracy} step={0.01} min={0} max={1} />
          </div>
        );
      case "summary":
        return null;
    }
  }

  function handleExecute() {
    if (tab === "summary") {
      fetchSummary();
      return;
    }
    const endpoints: Record<string, string> = {
      partition: "/fed-reason/partition",
      privacy: "/fed-reason/privacy",
      aggregate: "/fed-reason/aggregate",
      communicate: "/fed-reason/communicate",
      heterogeneous: "/fed-reason/heterogeneous",
      pipeline: "/fed-reason/pipeline",
    };
    const bodies: Record<string, Record<string, unknown>> = {
      partition: { graph_id: graphId, partition_method: partitionMethod, num_clients: numClients, overlap_ratio: overlapRatio, boundary_strategy: "shared_nodes", topology_config: {} },
      privacy: { graph_id: graphId, privacy_level: privacyLevel, epsilon, delta, reasoning_type: reasoningType, num_rounds: numRounds, sensitivity },
      aggregate: { graph_id: graphId, aggregation_method: aggregationMethod, num_clients: numClients, num_rounds: numRounds, participation_rate: participationRate },
      communicate: { graph_id: graphId, compress_method: compressMethod, bandwidth_limit_mbps: bandwidthLimit, num_rounds: numRounds, message_size_mb: messageSize, latency_ms: latency },
      heterogeneous: { graph_id: graphId, num_clients: numClients, client_distribution: clientDistribution, data_heterogeneity: dataHeterogeneity, resource_variance: resourceVariance },
      pipeline: { graph_id: graphId, total_rounds: totalRounds, privacy_budget: privacyBudget, num_clients: numClients, target_accuracy: targetAccuracy },
    };
    callApi(endpoints[tab], bodies[tab]);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Graph Federated Reasoning</h1>
          <p className="text-sm text-gray-400">v1.209 — Privacy-preserving distributed reasoning across federated graphs</p>
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-900 rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResult(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        {tab !== "summary" && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4">
            {renderControls()}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleExecute}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Running..." : "Execute"}
              </button>
            </div>
          </div>
        )}

        {/* Summary Button */}
        {tab === "summary" && (
          <div className="mb-4">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Loading..." : "Load Summary"}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Result</h3>
            <JsonBlock data={result} />
          </div>
        )}

        {/* Info Cards */}
        {!result && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">6 Partition Methods</h3>
              <p className="text-xs text-gray-400">Spectral, random, community, hash, topology-aware, and adaptive graph partitioning with overlap management for boundary nodes.</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-2">6 Privacy Levels</h3>
              <p className="text-xs text-gray-400">None, local DP, global DP, CD-DP, secure aggregation, and TEE — with formal (ε,δ)-differential privacy guarantees.</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-400 mb-2">6 Aggregation Methods</h3>
              <p className="text-xs text-gray-400">FedAvg, FedProx, SCAFFOLD, MOON, FedNova, and personalized aggregation with convergence tracking.</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">6 Compression Methods</h3>
              <p className="text-xs text-gray-400">TopK, RandomK, quantization, sparsification, Hadamard, and none — optimizing communication efficiency.</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-2">6 Client Types</h3>
              <p className="text-xs text-gray-400">High/medium/low resource, edge, mobile, and IoT — with heterogeneous capability adaptation.</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">6 Reasoning Types</h3>
              <p className="text-xs text-gray-400">Inductive, transductive, hybrid, few-shot, zero-shot, and meta-reasoning across federated participants.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
