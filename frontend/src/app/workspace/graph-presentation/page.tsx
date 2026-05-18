"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface VisualizationResult {
  type: string;
  layout?: string;
  iterations?: number;
  width?: number;
  height?: number;
  charge_strength?: number;
}

interface RenderingResult {
  type: string;
  node_size?: number;
  edge_width?: number;
  node_color?: string;
  edge_color?: string;
}

interface AnimationResult {
  type: string;
  duration?: number;
  easing?: string;
  frames?: number;
  fps?: number;
}

export default function GraphPresentationPage() {
  const [activeTab, setActiveTab] = useState("visualization");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Visualization state
  const [vizType, setVizType] = useState("force");
  const [layout, setLayout] = useState("2d");
  const [iterations, setIterations] = useState(100);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [visualizationResult, setVisualizationResult] = useState<VisualizationResult | null>(null);

  // Rendering state
  const [renderType, setRenderType] = useState("svg");
  const [nodeSize, setNodeSize] = useState(10);
  const [edgeWidth, setEdgeWidth] = useState(1.0);
  const [nodeColor, setNodeColor] = useState("#4a90d9");
  const [edgeColor, setEdgeColor] = useState("#cccccc");
  const [renderingResult, setRenderingResult] = useState<RenderingResult | null>(null);

  // Animation state
  const [animType, setAnimType] = useState("force");
  const [duration, setDuration] = useState(1000);
  const [easing, setEasing] = useState("ease-in-out");
  const [frames, setFrames] = useState(30);
  const [animationResult, setAnimationResult] = useState<AnimationResult | null>(null);

  // Run visualization
  const runVisualization = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/visualization/layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          viz_type: vizType,
          layout: layout,
          iterations: iterations,
          width: width,
          height: height,
        }),
      });
      const data = await res.json();
      setVisualizationResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run rendering
  const runRendering = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/rendering/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          render_type: renderType,
          node_size: nodeSize,
          edge_width: edgeWidth,
          node_color: nodeColor,
          edge_color: edgeColor,
        }),
      });
      const data = await res.json();
      setRenderingResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run animation
  const runAnimation = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph.animation/animate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          anim_type: animType,
          duration: duration,
          easing: easing,
          frames: frames,
        }),
      });
      const data = await res.json();
      setAnimationResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Presentation</h1>
          <p className="text-muted-foreground">Visualization, Rendering & Animation</p>
        </div>
        <Badge variant="outline">v1.68</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="rendering">Rendering</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
        </TabsList>

        {/* Visualization Tab */}
        <TabsContent value="visualization">
          <Card>
            <CardHeader>
              <CardTitle>Graph Visualization</CardTitle>
              <CardDescription>
                Generate graph layouts and visualizations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Visualization Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={vizType}
                    onChange={(e) => setVizType(e.target.value)}
                  >
                    <option value="force">Force-directed</option>
                    <option value="spectral">Spectral</option>
                    <option value="kamada">Kamada-Kawai</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                  >
                    <option value="2d">2D</option>
                    <option value="3d">3D</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Iterations</Label>
                  <Input
                    type="number"
                    value={iterations}
                    onChange={(e) => setIterations(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runVisualization} disabled={loading}>
                {loading ? "Visualizing..." : "Run Visualization"}
              </Button>

              {visualizationResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(visualizationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rendering Tab */}
        <TabsContent value="rendering">
          <Card>
            <CardHeader>
              <CardTitle>Graph Rendering</CardTitle>
              <CardDescription>
                Render graph with different engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Rendering Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={renderType}
                    onChange={(e) => setRenderType(e.target.value)}
                  >
                    <option value="svg">SVG</option>
                    <option value="canvas">Canvas</option>
                    <option value="webgl">WebGL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Node Size</Label>
                  <Input
                    type="number"
                    value={nodeSize}
                    onChange={(e) => setNodeSize(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edge Width</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={edgeWidth}
                    onChange={(e) => setEdgeWidth(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Node Color</Label>
                  <Input
                    type="text"
                    value={nodeColor}
                    onChange={(e) => setNodeColor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edge Color</Label>
                  <Input
                    type="text"
                    value={edgeColor}
                    onChange={(e) => setEdgeColor(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={runRendering} disabled={loading}>
                {loading ? "Rendering..." : "Run Rendering"}
              </Button>

              {renderingResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(renderingResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Tab */}
        <TabsContent value="animation">
          <Card>
            <CardHeader>
              <CardTitle>Graph Animation</CardTitle>
              <CardDescription>
                Animate graph transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Animation Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={animType}
                    onChange={(e) => setAnimType(e.target.value)}
                  >
                    <option value="force">Force</option>
                    <option value="transition">Transition</option>
                    <option value="timeline">Timeline</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (ms)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Easing</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={easing}
                    onChange={(e) => setEasing(e.target.value)}
                  >
                    <option value="linear">Linear</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In-Out</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Frames</Label>
                  <Input
                    type="number"
                    value={frames}
                    onChange={(e) => setFrames(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runAnimation} disabled={loading}>
                {loading ? "Animating..." : "Run Animation"}
              </Button>

              {animationResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(animationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}