"use client";

import { useEffect, useState } from "react";
import {
  TrophyIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  BarChart3Icon,
  RefreshCwIcon,
  SettingsIcon,
  FilterIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VersionRankingEntry {
  version_id: string;
  rank: number;
  position_change: number;
  scores: Record<string, number>;
  grade: string;
}

interface VersionRankingResponse {
  rankings: VersionRankingEntry[];
  total_versions: number;
  timestamp: string;
}

interface RankingDimension {
  key: string;
  label: string;
  weight: number;
  direction: string;
}

// ============================================================
// Version Ranking Page
// ============================================================

export default function VersionRankingPage() {
  const [rankings, setRankings] = useState<VersionRankingResponse | null>(null);
  const [dimensions, setDimensions] = useState<RankingDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(["entity_count"]);
  const [limit, setLimit] = useState(10);

  // Load rankings
  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/knowledge-graph/versions/ranking/enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dimensions: selectedDimensions, limit }),
      });
      if (!response.ok) throw new Error("Failed to fetch rankings");
      const data = await response.json();
      setRankings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Load available dimensions
  const fetchDimensions = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/ranking/dimensions");
      if (!response.ok) return;
      const data = await response.json();
      setDimensions(Object.entries(data.dimensions || {}).map(([key, val]: [string, any]) => ({
        key,
        label: val.label,
        weight: val.weight,
        direction: val.direction,
      })));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchDimensions();
    fetchRankings();
  }, []);

  const handleDimensionChange = (dim: string) => {
    if (!selectedDimensions.includes(dim)) {
      setSelectedDimensions([...selectedDimensions, dim]);
    }
  };

  const removeDimension = (dim: string) => {
    if (selectedDimensions.length > 1) {
      setSelectedDimensions(selectedDimensions.filter((d) => d !== dim));
    }
  };

  // Grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500";
      case "B":
        return "bg-blue-500";
      case "C":
        return "bg-yellow-500";
      case "D":
        return "bg-orange-500";
      default:
        return "bg-red-500";
    }
  };

  // Position change icon
  const getPositionIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            Version Rankings
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and compare version performance across multiple dimensions
          </p>
        </div>
        <Button onClick={fetchRankings} disabled={loading}>
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Ranking Configuration
          </CardTitle>
          <CardDescription>Select dimensions to include in ranking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {dimensions.map((dim) => (
              <Badge
                key={dim.key}
                variant={selectedDimensions.includes(dim.key) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleDimensionChange(dim.key)}
              >
                {dim.label}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Limit:</span>
              <Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3Icon className="h-5 w-5" />
            Current Rankings
          </CardTitle>
          <CardDescription>
            {rankings ? `${rankings.total_versions} versions tracked` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : rankings?.rankings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No versions available. Create a version to see rankings.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-2">Version</div>
                <div className="col-span-2">Grade</div>
                <div className="col-span-2">Entities</div>
                <div className="col-span-2">Relations</div>
                <div className="col-span-2">Activity</div>
                <div className="col-span-1">Change</div>
              </div>

              {/* Table Rows */}
              {rankings?.rankings.map((entry) => (
                <div
                  key={entry.version_id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 items-center bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="col-span-1">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        entry.rank <= 3 ? "bg-yellow-500/20 text-yellow-500" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </div>
                  <div className="col-span-2 font-medium">{entry.version_id}</div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${getGradeColor(entry.grade)}`}
                    >
                      {entry.grade}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm">
                    {entry.scores.entity_count?.toFixed(0) || "-"}
                  </div>
                  <div className="col-span-2 text-sm">
                    {entry.scores.relation_count?.toFixed(0) || "-"}
                  </div>
                  <div className="col-span-2 text-sm">
                    {entry.scores.activity?.toFixed(1) || "-"}
                  </div>
                  <div className="col-span-1">{getPositionIcon(entry.position_change)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {rankings?.rankings[0] ? (
              <div>
                <div className="text-2xl font-bold">{rankings.rankings[0].version_id}</div>
                <div className="text-sm text-muted-foreground">
                  Grade: {rankings.rankings[0].grade}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">N/A</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rankings?.total_versions || 0}</div>
            <div className="text-sm text-muted-foreground">Tracked</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            {rankings?.rankings.length ? (
              <div className="text-2xl font-bold">
                {(
                  rankings.rankings.reduce((sum, r) => {
                    const scores = Object.values(r.scores);
                    return sum + scores.reduce((a, b) => a + b, 0) / scores.length;
                  }, 0) / rankings.rankings.length
                ).toFixed(1)}
              </div>
            ) : (
              <div className="text-muted-foreground">N/A</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}