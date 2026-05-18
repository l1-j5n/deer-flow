"use client";

import { useEffect, useState } from "react";
import {
  BoxIcon,
  LayersIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  Grid3X3Icon,
  RotateCcwIcon,
  Maximize2Icon,
  Share2Icon,
  SettingsIcon,
  PaletteIcon,
  ImageIcon,
  FileIcon,
  FileCodeIcon,
  LoaderIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// ============================================================
// 3D Visualization & Custom Dashboard Page
// ============================================================

interface SceneObject {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  metadata: Record<string, unknown>;
}

interface CameraConfig {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
}

interface Scene3D {
  objects: SceneObject[];
  camera: CameraConfig;
  background: string;
  lighting: { ambient: number; directional: number };
  timestamp: string;
}

interface CustomWidget {
  id: string;
  type: string;
  title: string;
  position: Record<string, number>;
  size: Record<string, number>;
  config: Record<string, unknown>;
  data_source: Record<string, unknown>;
}

interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  widgets: CustomWidget[];
  theme: string;
  created_at: string;
  updated_at: string;
}

interface ExportData {
  export_id: string;
  format: string;
  data_url: string;
  timestamp: string;
  expires_at: string;
}

// ============================================================
// API Functions
// ============================================================

async function fetchScene3D(mode: string = "network", rotation: number = 0): Promise<Scene3D> {
  const res = await fetch(`/api/versions/visualization/3d?mode=${mode}&rotation=${rotation}`);
  if (!res.ok) throw new Error("Failed to fetch 3D scene");
  return res.json();
}

async function createCustomDashboard(data: {
  name: string;
  description: string;
  widgets: CustomWidget[];
  theme: string;
}): Promise<CustomDashboard> {
  const res = await fetch("/api/versions/visualization/dashboard/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create dashboard");
  return res.json();
}

async function listCustomDashboards(): Promise<CustomDashboard[]> {
  const res = await fetch("/api/versions/visualization/dashboard/custom");
  if (!res.ok) throw new Error("Failed to list dashboards");
  return res.json();
}

async function deleteCustomDashboard(id: string): Promise<void> {
  const res = await fetch(`/api/versions/visualization/dashboard/custom/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete dashboard");
}

async function exportVisualization(
  view: string = "dashboard",
  format: string = "png",
  width: number = 1920,
  height: number = 1080
): Promise<ExportData> {
  const res = await fetch(
    `/api/versions/visualization/export?view=${view}&format=${format}&width=${width}&height=${height}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to export visualization");
  return res.json();
}

// ============================================================
// 3D Scene Renderer (Simplified WebGL-like)
// ============================================================

function Scene3DRenderer({ scene }: { scene: Scene3D }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!scene.objects.length) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        No 3D objects to render
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-lg bg-black">
      {/* Pseudo-3D renderer in 2D canvas style */}
      <div
        className="absolute inset-0"
        style={{ background: scene.background }}
      >
        {/* Draw 3D objects as positioned rectangles */}
        {scene.objects.map((obj) => {
          const isSelected = selected === obj.id;
          const x = 50 + (obj.position.x / 10) * 50 + 25;
          const y = 50 + (obj.position.y / 10) * 50 + 25;
          const size = (obj.scale.x) * 30;

          return (
            <div
              key={obj.id}
              className={`absolute cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
              }`}
              style={{
                left: `${Math.max(0, Math.min(90, x))}%`,
                top: `${Math.max(0, Math.min(90, y))}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: obj.color,
                opacity: 0.8,
                transform: `rotate(${obj.rotation.y}deg)`,
                borderRadius: obj.type === "sphere" ? "50%" : "4px",
              }}
              onClick={() => setSelected(obj.id)}
              title={`${obj.id}: ${JSON.stringify(obj.metadata)}`}
            />
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-2 text-xs">
          <Badge variant="secondary" className="bg-green-600">High Quality</Badge>
          <Badge variant="secondary" className="bg-blue-600">Normal</Badge>
          <Badge variant="secondary" className="bg-purple-600">Low</Badge>
          <Badge variant="secondary" className="bg-yellow-600">Archived</Badge>
          <Badge variant="secondary" className="bg-red-600">Deprecated</Badge>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Dashboard Builder
// ============================================================

function DashboardBuilder({
  dashboards,
  onCreate,
  onDelete,
}: {
  dashboards: CustomDashboard[];
  onCreate: (data: { name: string; description: string; widgets: CustomWidget[]; theme: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("dark");
  const [showDialog, setShowDialog] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({
      name,
      description,
      widgets: [],
      theme,
    });
    setShowDialog(false);
    setName("");
    setDescription("");
  };

  const widgetTypes = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "gauge", label: "Gauge" },
    { value: "table", label: "Table" },
    { value: "timeline", label: "Timeline" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom Dashboards</h3>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Dashboard</DialogTitle>
              <DialogDescription>
                Design your own dashboard with custom widgets
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dashboard description..."
                />
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {dashboards.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            No custom dashboards yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dash) => (
            <Card key={dash.id}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">{dash.name}</CardTitle>
                <CardDescription className="text-xs">
                  {dash.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex items-center justify-between">
                <Badge variant="outline">{dash.widgets.length} widgets</Badge>
                <Button variant="ghost" size="icon" onClick={() => onDelete(dash.id)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Export Panel
// ============================================================

function ExportPanel() {
  const [view, setView] = useState("dashboard");
  const [format, setFormat] = useState("png");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExportData | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await exportVisualization(view, format, width, height);
      setResult(data);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { value: "png", label: "PNG Image", icon: ImageIcon },
    { value: "svg", label: "SVG Vector", icon: FileIcon },
    { value: "html", label: "HTML File", icon: FileCodeIcon },
    { value: "pdf", label: "PDF Document", icon: FileIcon },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadIcon className="w-5 h-5" />
            Export Visualization
          </CardTitle>
          <CardDescription>
            Export any visualization as image or file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>View</Label>
              <Select value={view} onValueChange={setView}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full">
            {loading ? (
              <>
                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-2">
              <Badge variant="outline">Export ID: {result.export_id}</Badge>
              <p className="text-xs text-muted-foreground">
                Format: {result.format.toUpperCase()} | {width}x{height}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function Version3DVisualizationPage() {
  const [activeTab, setActiveTab] = useState("3d");
  const [mode, setMode] = useState("network");
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<Scene3D | null>(null);
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([]);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [sceneData, dashList] = await Promise.all([
        fetchScene3D(mode, rotation),
        listCustomDashboards(),
      ]);

      setScene(sceneData);
      setDashboards(dashList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [mode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCreateDashboard = async (data: {
    name: string;
    description: string;
    widgets: CustomWidget[];
    theme: string;
  }) => {
    await createCustomDashboard(data);
    loadData();
  };

  const handleDeleteDashboard = async (id: string) => {
    await deleteCustomDashboard(id);
    loadData();
  };

  if (loading && !scene) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BoxIcon className="w-6 h-6" />
            Version 3D Visualization
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadData} className="mt-4">
              <RotateCcwIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BoxIcon className="w-6 h-6" />
          Version 3D Visualization
        </h1>
        <div className="flex items-center gap-2">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="scatter">Scatter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadData}>
            <RotateCcwIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="3d" className="flex items-center gap-2">
            <BoxIcon className="w-4 h-4" />
            3D View
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <LayersIcon className="w-4 h-4" />
            Dashboard Builder
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <DownloadIcon className="w-4 h-4" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="3d" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BoxIcon className="w-5 h-5" />
                3D Scene - {mode} mode
              </CardTitle>
              <CardDescription>
                {scene?.objects.length || 0} objects | Rotation: {rotation}°
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scene && <Scene3DRenderer scene={scene} />}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{scene?.objects.length || 0}</p>
                <p className="text-sm text-muted-foreground">Objects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{rotation}°</p>
                <p className="text-sm text-muted-foreground">Rotation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{scene?.camera.fov}°</p>
                <p className="text-sm text-muted-foreground">FOV</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{scene?.lighting.directional}</p>
                <p className="text-sm text-muted-foreground">Lighting</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <DashboardBuilder
            dashboards={dashboards}
            onCreate={handleCreateDashboard}
            onDelete={handleDeleteDashboard}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <ExportPanel />
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Last updated: {scene?.timestamp.slice(0, 19) || "-"}</span>
        <Badge variant="outline">v1.41.0</Badge>
      </div>
    </div>
  );
}