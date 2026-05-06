"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { searchEntities, queryRelations, getGraphStats, exportForVisualization } from "@/core/knowledge-graph";
import {
  NetworkIcon,
  SearchIcon,
  PlusIcon,
  Trash2Icon,
  RefreshCwIcon,
  BarChart3Icon,
  EyeIcon,
  ListIcon,
  MoveIcon,
  ZoomInIcon,
  ZoomOutIcon,
  Maximize2Icon,
  FileTextIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties?: Record<string, unknown>;
  source?: string;
  confidence: number;
  createdAt: string;
}

interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
}

interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
  averageConfidence: number;
}

interface VizNode {
  data: {
    id: string;
    label: string;
    type: string;
    confidence: number;
  };
}

interface VizEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };
}

interface VizGraph {
  nodes: VizNode[];
  edges: VizEdge[];
}

// ============================================================
// Canvas Graph Renderer
// ============================================================

interface GraphNode {
  id: string;
  label: string;
  type: string;
  confidence: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

const TYPE_COLORS: Record<string, string> = {
  person: "#3b82f6",
  organization: "#8b5cf6",
  concept: "#10b981",
  technology: "#f59e0b",
  location: "#ef4444",
  event: "#ec4899",
  default: "#6b7280",
};

function useGraphCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  graphData: VizGraph | null
) {
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const draggingRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef<string | null>(null);
  const animFrameRef = useRef<number>(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const initGraph = useCallback((data: VizGraph) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    const nodes: GraphNode[] = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.35;
      return {
        id: n.data.id,
        label: n.data.label,
        type: n.data.type,
        confidence: n.data.confidence,
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 20 + n.data.label.length * 2,
        color: (TYPE_COLORS[n.data.type] ?? TYPE_COLORS.default) || "#6b7280",
      };
    });

    const edges: GraphEdge[] = data.edges.map((e) => ({
      id: e.data.id,
      source: e.data.source,
      target: e.data.target,
      label: e.data.label,
    }));

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [canvasRef]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const { x: tx, y: ty, scale } = transformRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    // Draw edges
    for (const edge of edgesRef.current) {
      const source = nodesRef.current.find((n) => n.id === edge.source);
      const target = nodesRef.current.find((n) => n.id === edge.target);
      if (!source || !target) continue;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Edge label
      const mx = (source.x + target.x) / 2;
      const my = (source.y + target.y) / 2;
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(edge.label, mx, my - 4);
    }

    // Draw nodes
    for (const node of nodesRef.current) {
      const isHovered = hoveredRef.current === node.id;
      const isSelected = selectedNode === node.id;
      const r = node.radius + (isHovered || isSelected ? 4 : 0);

      // Glow effect
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}20`;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.color + "20";
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = `${isHovered ? "bold" : "normal"} 12px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, node.x, node.y);

      // Type badge below
      ctx.fillStyle = node.color;
      ctx.font = "9px sans-serif";
      ctx.fillText(node.type, node.x, node.y + r + 12);
    }

    ctx.restore();
  }, [canvasRef, selectedNode]);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    if (nodes.length === 0) return;

    const repulsion = 800;
    const spring = 0.03;
    const damping = 0.85;
    const centerForce = 0.005;

    const canvas = canvasRef.current;
    const cx = canvas ? canvas.width / 2 : 400;
    const cy = canvas ? canvas.height / 2 : 300;

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Spring (edges)
    for (const edge of edges) {
      const a = nodes.find((n) => n.id === edge.source);
      const b = nodes.find((n) => n.id === edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 120;
      const force = (dist - targetDist) * spring;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const node of nodes) {
      node.vx += (cx - node.x) * centerForce;
      node.vy += (cy - node.y) * centerForce;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }, [canvasRef]);

  const animate = useCallback(() => {
    simulate();
    draw();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [simulate, draw]);

  useEffect(() => {
    if (graphData) {
      initGraph(graphData);
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [graphData, initGraph, animate]);

  // Mouse handlers
  const getCanvasPos = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const { scale } = transformRef.current;
      return {
        x: (e.clientX - rect.left - transformRef.current.x) / scale,
        y: (e.clientY - rect.top - transformRef.current.y) / scale,
      };
    },
    [canvasRef]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasPos(e);
      for (const node of nodesRef.current) {
        const dx = pos.x - node.x;
        const dy = pos.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < node.radius + 4) {
          draggingRef.current = node.id;
          dragOffsetRef.current = { x: dx, y: dy };
          setSelectedNode(node.id);
          return;
        }
      }
      setSelectedNode(null);
    },
    [getCanvasPos]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCanvasPos(e);
      if (draggingRef.current) {
        const node = nodesRef.current.find((n) => n.id === draggingRef.current);
        if (node) {
          node.x = pos.x - dragOffsetRef.current.x;
          node.y = pos.y - dragOffsetRef.current.y;
          node.vx = 0;
          node.vy = 0;
        }
      } else {
        let hovered: string | null = null;
        for (const node of nodesRef.current) {
          const dx = pos.x - node.x;
          const dy = pos.y - node.y;
          if (Math.sqrt(dx * dx + dy * dy) < node.radius + 4) {
            hovered = node.id;
            break;
          }
        }
        hoveredRef.current = hovered;
      }
    },
    [getCanvasPos]
  );

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    transformRef.current.scale = Math.min(transformRef.current.scale * 1.2, 3);
  }, []);

  const zoomOut = useCallback(() => {
    transformRef.current.scale = Math.max(transformRef.current.scale / 1.2, 0.3);
  }, []);

  const resetView = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      transformRef.current = { x: 0, y: 0, scale: 1 };
    }
  }, [canvasRef]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
    selectedNode,
    nodesRef,
  };
}

// ============================================================
// Main Page Component
// ============================================================

export default function KnowledgeGraphPage() {
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [relations, setRelations] = useState<KnowledgeRelation[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("visualization");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vizData, setVizData] = useState<VizGraph | null>(null);

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
    selectedNode,
    nodesRef,
  } = useGraphCanvas(canvasRef, vizData);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ents, rels, st, viz] = await Promise.all([
          searchEntities({}),
          queryRelations({}),
          getGraphStats(),
          exportForVisualization(),
        ]);
        setEntities((ents ?? []) as KnowledgeEntity[]);
        setRelations((rels ?? []) as KnowledgeRelation[]);
        setStats(st as GraphStats | null);
        setVizData((viz ?? { nodes: [], edges: [] }) as VizGraph);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [activeTab]);

  const filteredEntities = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedNodeData = selectedNode
    ? entities.find((e) => e.id === selectedNode)
    : null;

  const selectedNodeRelations = selectedNode
    ? relations.filter((r) => r.sourceId === selectedNode || r.targetId === selectedNode)
    : [];

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NetworkIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Graph</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <PlusIcon className="size-4 mr-2" />
            Add Entity
          </Button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntities}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Relations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRelations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.entityTypes).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.averageConfidence * 100).toFixed(0)}%</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visualization">
            <EyeIcon className="size-4 mr-1" />
            Visualization
          </TabsTrigger>
          <TabsTrigger value="list">
            <ListIcon className="size-4 mr-1" />
            Entity List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <NetworkIcon className="size-5" />
                  Interactive Graph
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={zoomOut}>
                    <ZoomOutIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8" onClick={zoomIn}>
                    <ZoomInIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8" onClick={resetView}>
                    <Maximize2Icon className="size-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Drag nodes to rearrange. Click to select. Force-directed layout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[500px] w-full rounded-lg border bg-black/50">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                {vizData?.nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">No graph data available.</p>
                  </div>
                )}
              </div>

              {/* Selected Node Detail */}
              {selectedNodeData && (
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-4 rounded-full"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[selectedNodeData.type] ?? TYPE_COLORS.default,
                        }}
                      />
                      <span className="font-medium">{selectedNodeData.name}</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedNodeData.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {(selectedNodeData.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                  {selectedNodeData.description && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      {selectedNodeData.description}
                    </p>
                  )}
                  {selectedNodeRelations.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Relations</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedNodeRelations.map((rel) => {
                          const isSource = rel.sourceId === selectedNodeData.id;
                          const otherId = isSource ? rel.targetId : rel.sourceId;
                          const other = entities.find((e) => e.id === otherId);
                          return (
                            <Badge key={rel.id} variant="outline" className="text-xs">
                              {isSource ? "→" : "←"} {rel.type} {isSource ? "→" : "←"}{" "}
                              {other?.name ?? otherId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {!!selectedNodeData.properties?.sourceDocId && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-medium text-green-400">Source Documents</p>
                      <Badge
                        variant="outline"
                        className="text-xs border-green-500/30"
                      >
                        <FileTextIcon className="size-3 mr-1" />
                        {String(selectedNodeData.properties?.sourceDocTitle ?? "Unknown document")}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="size-5" />
                  Entities
                </CardTitle>
                <div className="relative w-64">
                  <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
                  <Input
                    placeholder="Search entities..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <CardDescription>
                {filteredEntities.length} of {entities.length} entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredEntities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <NetworkIcon className="text-muted-foreground mb-4 size-12" />
                  <p className="text-muted-foreground">No entities found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredEntities.map((entity) => (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="size-3 rounded-full"
                          style={{
                            backgroundColor: TYPE_COLORS[entity.type] ?? TYPE_COLORS.default,
                          }}
                        />
                        <Badge variant="outline" className="capitalize">
                          {entity.type}
                        </Badge>
                        <div>
                          <div className="font-medium">{entity.name}</div>
                          {entity.description && (
                            <p className="text-muted-foreground text-sm">{entity.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={entity.confidence > 0.8 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {(entity.confidence * 100).toFixed(0)}%
                        </Badge>
                        <Button variant="ghost" size="icon" className="size-8">
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
