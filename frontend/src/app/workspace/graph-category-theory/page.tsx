"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// ── Types ──────────────────────────────────────────────────────────────────

interface OverviewData {
  layer: number;
  version: string;
  engine: string;
  description: string;
  enums: Record<string, string[]>;
  enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number;
  config_space: number;
  cache_stats: Record<string, number>;
}

// ── Enum Options ───────────────────────────────────────────────────────────

const CATEGORY_TYPES = [
  { value: "causal", label: "Causal 因果范畴" },
  { value: "functorial", label: "Functorial 函子范畴" },
  { value: "monoidal", label: "Monoidal 幺半范畴" },
  { value: "topos", label: "Topos 拓扑斯" },
  { value: "sheaf_theoretic", label: "Sheaf Theoretic 层论" },
  { value: "ai_constructed", label: "AI-Constructed AI构造" },
];

const FUNCTOR_TYPES = [
  { value: "covariant", label: "Covariant 协变函子" },
  { value: "contravariant", label: "Contravariant 逆变函子" },
  { value: "adjoint", label: "Adjoint 伴随函子" },
  { value: "monoidal", label: "Monoidal 幺半函子" },
  { value: "enriched", label: "Enriched 富化函子" },
  { value: "ai_composed", label: "AI-Composed AI组合" },
];

const TRANSFORMATION_TYPES = [
  { value: "identity", label: "Identity 恒等变换" },
  { value: "isomorphism", label: "Isomorphism 同构变换" },
  { value: "epimorphism", label: "Epimorphism 满态射" },
  { value: "monomorphism", label: "Monomorphism 单态射" },
  { value: "equivalence", label: "Equivalence 等价变换" },
  { value: "ai_derived", label: "AI-Derived AI导出" },
];

const LIMIT_TYPES = [
  { value: "product", label: "Product 积" },
  { value: "equalizer", label: "Equalizer 等化子" },
  { value: "pullback", label: "Pullback 拉回" },
  { value: "terminal", label: "Terminal 终端对象" },
  { value: "inverse_limit", label: "Inverse Limit 逆极限" },
  { value: "ai_limit", label: "AI-Limit AI极限" },
];

const COLIMIT_TYPES = [
  { value: "coproduct", label: "Coproduct 余积" },
  { value: "coequalizer", label: "Coequalizer 余等化子" },
  { value: "pushout", label: "Pushout 推出" },
  { value: "initial", label: "Initial 初始对象" },
  { value: "direct_limit", label: "Direct Limit 正极限" },
  { value: "ai_colimit", label: "AI-Colimit AI余极限" },
];

const COMPOSITION_RULES = [
  { value: "sequential", label: "Sequential 顺序合成" },
  { value: "parallel", label: "Parallel 并行合成" },
  { value: "conditional", label: "Conditional 条件合成" },
  { value: "recursive", label: "Recursive 递归合成" },
  { value: "kleisli", label: "Kleisli 克莱斯利" },
  { value: "ai_composed", label: "AI-Composed AI组合" },
];

// ── Helper ─────────────────────────────────────────────────────────────────

const API = "/api/graph/causal-category-theory";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </Card>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-auto max-h-80 font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function GraphCategoryTheoryPage() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Categorize
  const [catType, setCatType] = useState("causal");
  const [catObjects, setCatObjects] = useState("X1, X2, X3, X4, X5");
  const [catMorphisms, setCatMorphisms] = useState("8");
  const [catStrictness, setCatStrictness] = useState("0.8");
  const [catResult, setCatResult] = useState<unknown>(null);

  // Functor
  const [funType, setFunType] = useState("covariant");
  const [funSource, setFunSource] = useState("CausalGraph");
  const [funTarget, setFunTarget] = useState("SymmetryGroup");
  const [funResult, setFunResult] = useState<unknown>(null);

  // Transform
  const [transType, setTransType] = useState("isomorphism");
  const [transSource, setTransSource] = useState("F");
  const [transTarget, setTransTarget] = useState("G");
  const [transComponents, setTransComponents] = useState("6");
  const [transResult, setTransResult] = useState<unknown>(null);

  // Limit
  const [limType, setLimType] = useState("pullback");
  const [limShape, setLimShape] = useState("cospan");
  const [limObjects, setLimObjects] = useState("4");
  const [limCones, setLimCones] = useState("3");
  const [limResult, setLimResult] = useState<unknown>(null);

  // Colimit
  const [colType, setColType] = useState("pushout");
  const [colShape, setColShape] = useState("span");
  const [colObjects, setColObjects] = useState("4");
  const [colCocones, setColCocones] = useState("3");
  const [colResult, setColResult] = useState<unknown>(null);

  // Compose
  const [compRule, setCompRule] = useState("sequential");
  const [compMorphisms, setCompMorphisms] = useState("f, g, h, k");
  const [compThreshold, setCompThreshold] = useState("0.1");
  const [compResult, setCompResult] = useState<unknown>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/overview`);
      const data = await res.json();
      setOverview(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorize = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/categorize`, {
        category_type: catType,
        objects: catObjects.split(",").map((s) => s.trim()),
        morphism_count: parseInt(catMorphisms),
        strictness: parseFloat(catStrictness),
      });
      setCatResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchFunctor = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/functor`, {
        functor_type: funType,
        source_category: funSource,
        target_category: funTarget,
        preserve_structure: true,
      });
      setFunResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransform = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/transform`, {
        transformation_type: transType,
        source_functor: transSource,
        target_functor: transTarget,
        components: parseInt(transComponents),
      });
      setTransResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchLimit = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/limit`, {
        limit_type: limType,
        diagram_shape: limShape,
        objects: parseInt(limObjects),
        cones: parseInt(limCones),
      });
      setLimResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchColimit = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/colimit`, {
        colimit_type: colType,
        diagram_shape: colShape,
        objects: parseInt(colObjects),
        cocones: parseInt(colCocones),
      });
      setColResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompose = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/compose`, {
        rule: compRule,
        morphisms: compMorphisms.split(",").map((s) => s.trim()),
        identity_threshold: parseFloat(compThreshold),
        associativity_check: true,
      });
      setCompResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Causal Category Theory Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            因果范畴论与函子语义引擎 — Layer 45 (v1.293)
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          6^6 = 46,656 configurations
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categorize">Categorize</TabsTrigger>
          <TabsTrigger value="functor">Functor</TabsTrigger>
          <TabsTrigger value="transform">Transform</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="colimit">Colimit</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Causal Category Theory Engine — universal categorical language
                for the causal intelligence stack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>
                {loading ? "Loading..." : "Load Overview"}
              </Button>
              {overview && (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <StatCard title="Layer" value={overview.layer} />
                    <StatCard title="Enums" value={overview.enum_count} />
                    <StatCard title="Endpoints" value={overview.endpoint_count} />
                    <StatCard title="Config Space" value={overview.config_space.toLocaleString()} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Enums</h3>
                    {Object.entries(overview.enums).map(([name, values]) => (
                      <div key={name} className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground">{name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {values.map((v) => (
                            <Badge key={v} variant="secondary" className="text-xs">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Endpoints</h3>
                    <div className="space-y-1">
                      {overview.endpoints.map((ep) => (
                        <div key={ep.path} className="flex items-center gap-2 text-xs">
                          <Badge variant={ep.method === "GET" ? "default" : "outline"}>
                            {ep.method}
                          </Badge>
                          <code className="text-muted-foreground">{ep.path}</code>
                          <span className="text-muted-foreground">— {ep.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Cache Stats</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(overview.cache_stats).map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="font-medium">{k}:</span>{" "}
                          <span className="text-muted-foreground">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Categorize Tab ────────────────────────────────────── */}
        <TabsContent value="categorize">
          <Card>
            <CardHeader>
              <CardTitle>Categorize 范畴化</CardTitle>
              <CardDescription>
                Classify causal structures into mathematical categories (objects,
                morphisms, subcategories)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category Type</Label>
                  <Select value={catType} onValueChange={setCatType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Objects (comma-separated)</Label>
                  <Input value={catObjects} onChange={(e) => setCatObjects(e.target.value)} />
                </div>
                <div>
                  <Label>Morphism Count</Label>
                  <Input type="number" value={catMorphisms} onChange={(e) => setCatMorphisms(e.target.value)} />
                </div>
                <div>
                  <Label>Strictness</Label>
                  <Input type="number" step="0.1" value={catStrictness} onChange={(e) => setCatStrictness(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchCategorize} disabled={loading}>
                {loading ? "Computing..." : "Categorize Structure"}
              </Button>
              {catResult && <JsonBlock data={catResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Functor Tab ────────────────────────────────────────── */}
        <TabsContent value="functor">
          <Card>
            <CardHeader>
              <CardTitle>Functor 函子映射</CardTitle>
              <CardDescription>
                Apply functors to map between causal categories with structure
                preservation analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Functor Type</Label>
                  <Select value={funType} onValueChange={setFunType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FUNCTOR_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Source Category</Label>
                  <Input value={funSource} onChange={(e) => setFunSource(e.target.value)} />
                </div>
                <div>
                  <Label>Target Category</Label>
                  <Input value={funTarget} onChange={(e) => setFunTarget(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchFunctor} disabled={loading}>
                {loading ? "Mapping..." : "Apply Functor"}
              </Button>
              {funResult && <JsonBlock data={funResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Transform Tab ──────────────────────────────────────── */}
        <TabsContent value="transform">
          <Card>
            <CardHeader>
              <CardTitle>Transform 自然变换</CardTitle>
              <CardDescription>
                Apply natural transformations between functors with component-wise
                naturality verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transformation Type</Label>
                  <Select value={transType} onValueChange={setTransType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRANSFORMATION_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Components</Label>
                  <Input type="number" value={transComponents} onChange={(e) => setTransComponents(e.target.value)} />
                </div>
                <div>
                  <Label>Source Functor</Label>
                  <Input value={transSource} onChange={(e) => setTransSource(e.target.value)} />
                </div>
                <div>
                  <Label>Target Functor</Label>
                  <Input value={transTarget} onChange={(e) => setTransTarget(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchTransform} disabled={loading}>
                {loading ? "Transforming..." : "Apply Transformation"}
              </Button>
              {transResult && <JsonBlock data={transResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Limit Tab ──────────────────────────────────────────── */}
        <TabsContent value="limit">
          <Card>
            <CardHeader>
              <CardTitle>Limit 极限</CardTitle>
              <CardDescription>
                Compute categorical limits (products, equalizers, pullbacks,
                terminal objects, inverse limits)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Limit Type</Label>
                  <Select value={limType} onValueChange={setLimType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LIMIT_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Diagram Shape</Label>
                  <Input value={limShape} onChange={(e) => setLimShape(e.target.value)} />
                </div>
                <div>
                  <Label>Objects</Label>
                  <Input type="number" value={limObjects} onChange={(e) => setLimObjects(e.target.value)} />
                </div>
                <div>
                  <Label>Cones</Label>
                  <Input type="number" value={limCones} onChange={(e) => setLimCones(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchLimit} disabled={loading}>
                {loading ? "Computing..." : "Compute Limit"}
              </Button>
              {limResult && <JsonBlock data={limResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Colimit Tab ────────────────────────────────────────── */}
        <TabsContent value="colimit">
          <Card>
            <CardHeader>
              <CardTitle>Colimit 余极限</CardTitle>
              <CardDescription>
                Compute categorical colimits (coproducts, coequalizers, pushouts,
                initial objects, direct limits)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Colimit Type</Label>
                  <Select value={colType} onValueChange={setColType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLIMIT_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Diagram Shape</Label>
                  <Input value={colShape} onChange={(e) => setColShape(e.target.value)} />
                </div>
                <div>
                  <Label>Objects</Label>
                  <Input type="number" value={colObjects} onChange={(e) => setColObjects(e.target.value)} />
                </div>
                <div>
                  <Label>Cocones</Label>
                  <Input type="number" value={colCocones} onChange={(e) => setColCocones(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchColimit} disabled={loading}>
                {loading ? "Computing..." : "Compute Colimit"}
              </Button>
              {colResult && <JsonBlock data={colResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Compose Tab ────────────────────────────────────────── */}
        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose 态射合成</CardTitle>
              <CardDescription>
                Compose causal morphisms using sequential, parallel, conditional,
                recursive, and Kleisli composition rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Composition Rule</Label>
                  <Select value={compRule} onValueChange={setCompRule}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMPOSITION_RULES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Morphisms (comma-separated)</Label>
                  <Input value={compMorphisms} onChange={(e) => setCompMorphisms(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Identity Threshold</Label>
                  <Input type="number" step="0.05" value={compThreshold} onChange={(e) => setCompThreshold(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchCompose} disabled={loading}>
                {loading ? "Composing..." : "Compose Morphisms"}
              </Button>
              {compResult && <JsonBlock data={compResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
