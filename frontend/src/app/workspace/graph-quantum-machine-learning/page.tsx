"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

interface OverviewData {
  layer: number; version: string; engine: string; description: string;
  enums: Record<string, string[]>; enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number; config_space: number; cache_stats: Record<string, number>;
}

const QML_ALGORITHMS = [
  { value: "quantum_svm", label: "Quantum SVM 量子SVM" },
  { value: "quantum_knn", label: "Quantum KNN 量子KNN" },
  { value: "quantum_decision_tree", label: "Decision Tree 决策树" },
  { value: "quantum_gaussian_process", label: "Gaussian Process 高斯过程" },
  { value: "quantum_linear_regression", label: "Linear Regression 线性回归" },
  { value: "ai_qml_algorithm", label: "AI QML 算法" },
];
const QUANTUM_KERNELS = [
  { value: "zz_feature_kernel", label: "ZZ Feature" },
  { value: "pauli_expansion_kernel", label: "Pauli Expansion" },
  { value: "quantum_rbf_kernel", label: "Quantum RBF" },
  { value: "projected_kernel", label: "Projected 投影核" },
  { value: "swap_test_kernel", label: "Swap Test 交换测试" },
  { value: "ai_quantum_kernel", label: "AI 量子核" },
];
const QUANTUM_NEURAL_NETS = [
  { value: "pqc_network", label: "PQC Network 参数化量子" },
  { value: "quantum_gan", label: "Quantum GAN 量子生成" },
  { value: "quantum_rnn", label: "Quantum RNN 量子循环" },
  { value: "quantum_transformer", label: "Transformer 量子变换" },
  { value: "quantum_autoencoder", label: "Autoencoder 量子自编码" },
  { value: "ai_quantum_neural_net", label: "AI QNN" },
];
const FEATURE_MAPS = [
  { value: "z_feature_map", label: "Z Feature Z特征" },
  { value: "zz_feature_map", label: "ZZ Feature ZZ特征" },
  { value: "pauli_feature_map", label: "Pauli Feature 泡利特征" },
  { value: "efficient_su2", label: "Efficient SU2" },
  { value: "real_amplitudes", label: "Real Amplitudes 实振幅" },
  { value: "ai_feature_map", label: "AI 特征映射" },
];
const TRAINING_TYPES = [
  { value: "parameter_shift", label: "Parameter Shift 参数位移" },
  { value: "spsa_optimizer", label: "SPSA 优化器" },
  { value: "natural_gradient", label: "Natural Gradient 自然梯度" },
  { value: "quantum_aware_gradient", label: "QA Gradient 量子感知" },
  { value: "quantum_fisher_information", label: "QFI 量子Fisher" },
  { value: "ai_quantum_training", label: "AI 量子训练" },
];
const INFERENCE_TYPES = [
  { value: "sampling_inference", label: "Sampling 采样推理" },
  { value: "statevector_inference", label: "Statevector 状态向量" },
  { value: "shot_based_inference", label: "Shot-Based 测量推理" },
  { value: "error_mitigated_inference", label: "Error Mitigated 误差缓解" },
  { value: "ensemble_quantum_inference", label: "Ensemble 集成推理" },
  { value: "ai_quantum_inference", label: "AI 量子推理" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumMachineLearningPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [algorithmType, setAlgorithmType] = useState("quantum_svm");
  const [numFeatures, setNumFeatures] = useState("4");
  const [numSamples, setNumSamples] = useState("100");
  const [kernelType, setKernelType] = useState("zz_feature_kernel");
  const [featureDim, setFeatureDim] = useState("4");
  const [kernelQubits, setKernelQubits] = useState("4");
  const [networkType, setNetworkType] = useState("pqc_network");
  const [numLayers, setNumLayers] = useState("3");
  const [nnQubits, setNnQubits] = useState("4");
  const [mapType, setMapType] = useState("z_feature_map");
  const [mapFeatureDim, setMapFeatureDim] = useState("4");
  const [repetitions, setRepetitions] = useState("2");
  const [trainingType, setTrainingType] = useState("parameter_shift");
  const [learningRate, setLearningRate] = useState("0.01");
  const [numEpochs, setNumEpochs] = useState("100");
  const [inferenceType, setInferenceType] = useState("sampling_inference");
  const [numShots, setNumShots] = useState("1024");
  const [modelParams, setModelParams] = useState("50");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-machine-learning/overview`); const data = await res.json(); setOverview(data); setResult(data); }
    catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }
  async function postEndpoint(path: string, params: Record<string, string>) {
    setLoading(true); setResult(null);
    try { const qs = new URLSearchParams(params).toString(); const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" }); setResult(await res.json()); }
    catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Machine Learning Engine</h1>
          <p className="text-muted-foreground">Layer 85 — QML算法 / 量子核 / 量子神经网络 / 特征映射 / 训练策略 / 推理方法</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.333.0</Badge>
          <Badge variant="secondary">Layer 85</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="algorithm">QML算法</TabsTrigger>
          <TabsTrigger value="kernel">量子核</TabsTrigger>
          <TabsTrigger value="neural-net">量子神经网络</TabsTrigger>
          <TabsTrigger value="feature-map">特征映射</TabsTrigger>
          <TabsTrigger value="training">训练策略</TabsTrigger>
          <TabsTrigger value="inference">推理方法</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Machine Learning Engine 概览</CardTitle><CardDescription>量子机器学习引擎 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchOverview} disabled={loading}>{loading ? "加载中..." : "获取概览"}</Button>
            {overview && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card><CardHeader className="pb-2"><CardDescription>枚举数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.enum_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>端点数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.endpoint_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>配置空间</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>缓存命中</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{Object.values(overview.cache_stats).reduce((a: number, b: number) => a + b, 0)}</div></CardContent></Card>
            </div>)}
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="algorithm">
          <Card><CardHeader><CardTitle>QML算法 (Quantum ML Algorithm)</CardTitle><CardDescription>SVM/KNN/Decision Tree/GP/Linear Regression</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>算法类型</Label><Select value={algorithmType} onValueChange={setAlgorithmType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QML_ALGORITHMS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>特征数</Label><Input type="number" value={numFeatures} onChange={(e) => setNumFeatures(e.target.value)} min={1} max={1000} /></div>
              <div className="space-y-2"><Label>样本数</Label><Input type="number" value={numSamples} onChange={(e) => setNumSamples(e.target.value)} min={1} max={100000} /></div>
            </div>
            <Button onClick={() => postEndpoint("/graph/quantum-machine-learning/qml-algorithm", { algorithm_type: algorithmType, num_features: numFeatures, num_samples: numSamples })} disabled={loading}>{loading ? "计算中..." : "运行QML算法"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="kernel">
          <Card><CardHeader><CardTitle>量子核 (Quantum Kernel)</CardTitle><CardDescription>ZZ/Pauli/RBF/Projected/Swap Test</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>核类型</Label><Select value={kernelType} onValueChange={setKernelType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QUANTUM_KERNELS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>特征维度</Label><Input type="number" value={featureDim} onChange={(e) => setFeatureDim(e.target.value)} min={1} max={100} /></div>
              <div className="space-y-2"><Label>量子比特数</Label><Input type="number" value={kernelQubits} onChange={(e) => setKernelQubits(e.target.value)} min={1} max={1000} /></div>
            </div>
            <Button onClick={() => postEndpoint("/graph/quantum-machine-learning/quantum-kernel", { kernel_type: kernelType, feature_dimension: featureDim, num_qubits: kernelQubits })} disabled={loading}>{loading ? "计算中..." : "计算量子核"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="neural-net">
          <Card><CardHeader><CardTitle>量子神经网络 (Quantum Neural Network)</CardTitle><CardDescription>PQC/GAN/RNN/Transformer/Autoencoder</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>网络类型</Label><Select value={networkType} onValueChange={setNetworkType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QUANTUM_NEURAL_NETS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>层数</Label><Input type="number" value={numLayers} onChange={(e) => setNumLayers(e.target.value)} min={1} max={100} /></div>
              <div className="space-y-2"><Label>量子比特数</Label><Input type="number" value={nnQubits} onChange={(e) => setNnQubits(e.target.value)} min={1} max={1000} /></div>
            </div>
            <Button onClick={() => postEndpoint("/graph/quantum-machine-learning/quantum-neural-net", { network_type: networkType, num_layers: numLayers, num_qubits: nnQubits })} disabled={loading}>{loading ? "计算中..." : "构建量子神经网络"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="feature-map">
          <Card><CardHeader><CardTitle>特征映射 (Quantum Feature Map)</CardTitle><CardDescription>Z/ZZ/Pauli/EfficientSU2/RealAmplitudes</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>映射类型</Label><Select value={mapType} onValueChange={setMapType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FEATURE_MAPS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>特征维度</Label><Input type="number" value={mapFeatureDim} onChange={(e) => setMapFeatureDim(e.target.value)} min={1} max={100} /></div>
              <div className="space-y-2"><Label>重复次数</Label><Input type="number" value={repetitions} onChange={(e) => setRepetitions(e.target.value)} min={1} max={100} /></div>
            </div>
            <Button onClick={() => postEndpoint("/graph/quantum-machine-learning/quantum-feature-map", { map_type: mapType, feature_dimension: mapFeatureDim, repetitions: repetitions })} disabled={loading}>{loading ? "计算中..." : "构建特征映射"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="training">
          <Card><CardHeader><CardTitle>训练策略 (Quantum Training)</CardTitle><CardDescription>Parameter Shift/SPSA/Natural Gradient/QFI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>训练策略</Label><Select value={trainingType} onValueChange={setTrainingType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRAINING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>学习率</Label><Input type="number" value={learningRate} onChange={(e) => setLearningRate(e.target.value)} step={0.001} min={0.0001} max={10} /></div>
              <div className="space-y-2"><Label>训练轮数</Label><Input type="number" value={numEpochs} onChange={(e) => setNumEpochs(e.target.value)} min={1} max={100000} /></div>
            </div>
            <Button onClick={() => postEndpoint("/graph/quantum-machine-learning/quantum-training", { training_type: trainingType, learning_rate: learningRate, num_epochs: numEpochs })} disabled={loading}>{loading ? "计算中..." : "运行训练"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="inference">
          <Card><CardHeader><CardTitle>推理方法 (Quantum Inference)</CardTitle><CardDescription>Sampling/Statevector/Shot-Based/Error Mitigated/Ensemble</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>推理类型</Label><Select value={inferenceType} onValueChange={setInferenceType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INFERENCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>采样次数</Label><Input type="number" value={numShots} onChange={(e) => setNumShots(e.target.value)} min={1} max={1000000} /></div>
              <div className="space-y-2"><Label>模型参数数</Label><Input type="number" value={modelParams} onChange={(e) => setModelParams(e.target.value)} min={1} max={100000} /></div>
            </div>
            <Button onClick={() => postEndpoint("/graph/quantum-machine-learning/quantum-inference", { inference_type: inferenceType, num_shots: numShots, model_parameters: modelParams })} disabled={loading}>{loading ? "计算中..." : "运行推理"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
