"use client";

import { useEffect, useState } from "react";
import {
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  TimelineIcon,
  DocumentTextIcon,
  LightbulbIcon,
  StarIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ============================================================
// Version Intelligence Dashboard Page
// ============================================================

interface VersionQualityScore {
  version_id: string;
  overall_score: number;
  grade: string;
  dimensions: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  timestamp: string;
}

interface VersionRecommendation {
  version_id: string;
  similarity: number;
  recommendation_type: string;
  reason: string;
}

interface VersionTimelineEntry {
  version_id: string;
  timestamp: string;
  entity_count: number;
  relation_count: number;
  tag_count: number;
  activity_score: number;
}

interface TrendPrediction {
  metric: string;
  current_value: number;
  predicted_value: number;
  trend: string;
  confidence: number;
}

interface ComparisonReportItem {
  version_id: string;
  metrics: Record<string, number>;
  score: number | null;
}

interface ComparisonReport {
  versions: ComparisonReportItem[];
  comparison_type: string;
  summary: Record<string, string>;
  insights: string[];
  timestamp: string;
}

export default function VersionIntelligencePage() {
  const [qualityData, setQualityData] = useState<{ scores: VersionQualityScore[]; average_score: number } | null>(null);
  const [recommendations, setRecommendations] = useState<{ source_version: string; recommendations: VersionRecommendation[] } | null>(null);
  const [timeline, setTimeline] = useState<{ timeline: VersionTimelineEntry[] } | null>(null);
  const [predictions, setPredictions] = useState<{ predictions: TrendPrediction[] } | null>(null);
  const [report, setReport] = useState<ComparisonReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>("");

  // Fetch quality scores
  const fetchQualityScores = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/quality");
      if (!response.ok) throw new Error("Failed to fetch quality");
      const data = await response.json();
      setQualityData(data);
    } catch (err) {
      console.error("Quality error:", err);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async (versionId: string) => {
    try {
      const response = await fetch(`/api/knowledge-graph/versions/recommend/${versionId}?limit=5`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error("Recommendations error:", err);
    }
  };

  // Fetch timeline
  const fetchTimeline = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/timeline?order=desc");
      if (!response.ok) throw new Error("Failed to fetch timeline");
      const data = await response.json();
      setTimeline(data);
    } catch (err) {
      console.error("Timeline error:", err);
    }
  };

  // Fetch predictions
  const fetchPredictions = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/trend/prediction?metric=entities&period=30d");
      if (!response.ok) throw new Error("Failed to fetch predictions");
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error("Predictions error:", err);
    }
  };

  // Fetch comparison report
  const fetchReport = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/compare/report?versions=&comparison_type=metrics");
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Report error:", err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchQualityScores(), fetchTimeline(), fetchPredictions(), fetchReport()]);

    // Select first version for recommendations
    if (qualityData?.scores?.length > 0) {
      setSelectedVersion(qualityData.scores[0].version_id);
      await fetchRecommendations(qualityData.scores[0].version_id);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle version selection change
  const handleVersionChange = async (versionId: string) => {
    setSelectedVersion(versionId);
    await fetchRecommendations(versionId);
  };

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-500";
      case "B":
        return "text-blue-500";
      case "C":
        return "text-yellow-500";
      case "D":
        return "text-orange-500";
      default:
        return "text-red-500";
    }
  };

  // Get grade background
  const getGradeBg = (grade: string) => {
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

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (trend === "decreasing") return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SparklesIcon className="h-8 w-8 text-purple-500" />
            Version Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered version analysis, recommendations, and predictions
          </p>
        </div>
        <Button onClick={loadAllData} disabled={loading}>
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quality Overview */}
      {!loading && qualityData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Average Score */}
          <Card className="border-purple-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <SparklesIcon className="h-4 w-4" />
                Average Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">
                {qualityData.average_score.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </CardContent>
          </Card>

          {/* Total Versions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <StarIcon className="h-4 w-4" />
                Version Quality Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{qualityData.scores.length}</div>
              <p className="text-xs text-muted-foreground">versions analyzed</p>
            </CardContent>
          </Card>

          {/* Best Version */}
          {qualityData.scores[0] && (
            <Card className="border-green-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  Top Version
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">{qualityData.scores[0].version_id}</div>
                <Badge className={`${getGradeBg(qualityData.scores[0].grade)} mt-1`}>
                  Grade {qualityData.scores[0].grade}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Trend Prediction */}
          {predictions?.predictions?.[0] && (
            <Card className="border-blue-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  30-Day Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getTrendIcon(predictions.predictions[0].trend)}
                  <span className="font-bold capitalize">{predictions.predictions[0].trend}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(predictions.predictions[0].confidence * 100)}% confidence
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="quality" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quality">Quality Scores</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="report">Comparison Report</TabsTrigger>
        </TabsList>

        {/* Quality Tab */}
        <TabsContent value="quality">
          {!loading && qualityData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qualityData.scores.map((score) => (
                <Card key={score.version_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{score.version_id}</CardTitle>
                      <Badge className={`${getGradeBg(score.grade)} text-white`}>
                        {score.grade}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-500">
                      {score.overall_score}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Dimensions */}
                    {Object.entries(score.dimensions).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{key}</span>
                          <span className="font-bold">{value.toFixed(1)}</span>
                        </div>
                        <Progress value={value} className="h-2 mt-1" />
                      </div>
                    ))}

                    {/* Strengths */}
                    {score.strengths.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-green-500 mb-1">Strengths</div>
                        <ul className="text-xs space-y-1">
                          {score.strengths.map((s, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <CheckCircleIcon className="h-3 w-3 text-green-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {score.recommendations.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-blue-500 mb-1">Recommendations</div>
                        <ul className="text-xs space-y-1">
                          {score.recommendations.map((r, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <LightbulbIcon className="h-3 w-3 text-blue-500" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Version Recommendations</CardTitle>
              <CardDescription>
                Select a version to see related recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {qualityData && qualityData.scores.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm font-medium">Source Version</label>
                  <select
                    value={selectedVersion}
                    onChange={(e) => handleVersionChange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded border bg-background"
                  >
                    {qualityData.scores.map((score) => (
                      <option key={score.version_id} value={score.version_id}>
                        {score.version_id} (Grade {score.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recommendations && recommendations.recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No recommendations found
                </div>
              )}

              {recommendations && recommendations.recommendations.length > 0 && (
                <div className="space-y-3">
                  {recommendations.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <ArrowRightIcon className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium">{rec.version_id}</div>
                          <div className="text-sm text-muted-foreground">{rec.reason}</div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {rec.recommendation_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TimelineIcon className="h-5 w-5" />
                Version Timeline
              </CardTitle>
              <CardDescription>Chronological view of all versions</CardDescription>
            </CardHeader>
            <CardContent>
              {timeline && timeline.timeline.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No timeline data available
                </div>
              )}

              {timeline && timeline.timeline.length > 0 && (
                <div className="space-y-3">
                  {timeline.timeline.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{entry.version_id}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.timestamp || "No timestamp"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          Entities: {entry.entity_count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Relations: {entry.relation_count} | Tags: {entry.tag_count}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Comparison Report
              </CardTitle>
              <CardDescription>Comprehensive version comparison</CardDescription>
            </CardHeader>
            <CardContent>
              {report && report.versions.length > 0 && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(report.summary).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-muted">
                        <div className="text-sm text-muted-foreground capitalize">
                          {key.replace("_", " ")}
                        </div>
                        <div className="font-medium">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  {report.insights.length > 0 && (
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-sm font-medium text-blue-500 mb-2">
                        Key Insights
                      </div>
                      <ul className="space-y-1 text-sm">
                        {report.insights.map((insight, idx) => (
                          <li key={idx}>• {insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Version Details */}
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Version Details</div>
                    <div className="space-y-2">
                      {report.versions.map((v, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted">
                          <div className="font-medium">{v.version_id}</div>
                          <div className="text-sm text-muted-foreground">
                            E: {v.metrics.entities} | R: {v.metrics.relations} | A: {v.metrics.activity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {report && report.versions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No data for comparison
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}