"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphSpectralPage() {
  const [activeTab, setActiveTab] = useState("spectral");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Spectral
  const [analysisType, setAnalysisType] = useState("eigenvalues");
  const [normalize, setNormalize] = useState(true);
  const [k, setK] = useState(10);
  const [spectralResult, setSpectralResult] = useState<any>(null);

  // Signal Processing
  const [signalType, setSignalType] = useState("transform");
  const [values, setValues] = useState("");
  const [filterType, setFilterType] = useState("lowpass");
  const [tau, setTau] = useState(1.0);
  const [signalResult, setSignalResult] = useState<any>(null);

  // Wavelets
  const [waveletType, setWaveletType] = useState("haar");
  const [scales, setScales] = useState("1.0,2.0,4.0");
  const [threshold, setThreshold] = useState(0.1);
  const [waveletResult, setWaveletResult] = useState<any>(null);

  const runSpectral = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/spectral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, analysis_type: analysisType, normalize, k }),
      });
      setSpectralResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runSignal = async () => {
    setLoading(true);
    const valArray = values ? values.split(",").map(Number) : [];
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, signal_type: signalType, values: valArray, filter_type: filterType, tau }),
      });
      setSignalResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runWavelets = async () => {
    setLoading(true);
    const scaleArray = scales.split(",").map(Number);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/wavelets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, wavelet_type: waveletType, scales: scaleArray, threshold }),
      });
      setWaveletResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const resultCards = [
    { key: "spectral", label: "Spectral", result: spectralResult },
    { key: "signal", label: "Signal", result: signalResult },
    { key: "wavelets", label: "Wavelets", result: waveletResult },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Spectral Analysis</h1>
          <p className="text-muted-foreground">Spectral, Signal Processing & Wavelets</p>
        </div>
        <Badge variant="outline">v1.78</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spectral">Spectral</TabsTrigger>
          <TabsTrigger value="signal">Signal Processing</TabsTrigger>
          <TabsTrigger value="wavelets">Wavelets</TabsTrigger>
        </TabsList>

        <TabsContent value="spectral">
          <Card>
            <CardHeader>
              <CardTitle>Spectral Analysis</CardTitle>
              <CardDescription>Graph Laplacian eigenvalues and spectral methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  >
                    <option value="eigenvalues">Eigenvalues</option>
                    <option value="gap">Spectral Gap</option>
                    <option value="clustering">Spectral Clustering</option>
                    <option value="fiedler">Fiedler Vector</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>K (eigenvalues)</Label>
                  <Input type="number" value={k} onChange={(e) => setK(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={normalize}
                    onChange={(e) => setNormalize(e.target.checked)}
                  />
                  <Label>Normalize</Label>
                </div>
              </div>
              <Button onClick={runSpectral} disabled={loading}>
                {loading ? "Running..." : "Run Spectral Analysis"}
              </Button>
              {spectralResult && (
                <pre className="mt-4 p-4 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(spectralResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signal">
          <Card>
            <CardHeader>
              <CardTitle>Graph Signal Processing</CardTitle>
              <CardDescription>Graph Fourier Transform, filtering, interpolation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Signal Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={signalType}
                    onChange={(e) => setSignalType(e.target.value)}
                  >
                    <option value="transform">GFT Transform</option>
                    <option value="filter">Filtering</option>
                    <option value="interpolate">Interpolation</option>
                    <option value="convolve">Convolution</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Filter Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="lowpass">Lowpass</option>
                    <option value="highpass">Highpass</option>
                    <option value="bandpass">Bandpass</option>
                    <option value="graph">Graph</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tau (param)</Label>
                  <Input type="number" step="0.1" value={tau} onChange={(e) => setTau(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Values (comma)</Label>
                  <Input value={values} onChange={(e) => setValues(e.target.value)} placeholder="0.1,0.2,0.3" />
                </div>
              </div>
              <Button onClick={runSignal} disabled={loading}>
                {loading ? "Processing..." : "Run Signal Processing"}
              </Button>
              {signalResult && (
                <pre className="mt-4 p-4 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(signalResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wavelets">
          <Card>
            <CardHeader>
              <CardTitle>Graph Wavelets</CardTitle>
              <CardDescription>Wavelet transform on graphs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Wavelet Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={waveletType}
                    onChange={(e) => setWaveletType(e.target.value)}
                  >
                    <option value="haar">Haar</option>
                    <option value="mexican_hat">Mexican Hat</option>
                    <option value="morlet">Morlet</option>
                    <option value="shannon">Shannon</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Scales (comma)</Label>
                  <Input value={scales} onChange={(e) => setScales(e.target.value)} placeholder="1.0,2.0,4.0" />
                </div>
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input type="number" step="0.01" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
              </div>
              <Button onClick={runWavelets} disabled={loading}>
                {loading ? "Computing..." : "Run Wavelet Transform"}
              </Button>
              {waveletResult && (
                <pre className="mt-4 p-4 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(waveletResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>
      )}
    </div>
  );
}