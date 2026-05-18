"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// API base URL - uses relative path in Electron mode
const API_BASE = "";

interface CollaborationSession {
  session_id: string;
  name: string;
  created_by: string;
  participants: string[];
  view_state: Record<string, unknown>;
  cursor_positions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  status: string;
}

interface ReportSchedule {
  schedule_id: string;
  name: string;
  report_type: string;
  frequency: string;
  recipients: string[];
  format: string;
  filters: Record<string, unknown>;
  enabled: boolean;
  last_run: string | null;
  next_run: string;
  created_at: string;
}

interface VisualizationTemplate {
  template_id: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, unknown>;
  thumbnail: string | null;
  created_at: string;
}

interface InviteCode {
  code: string;
  session_id: string;
  role: string;
  expires_at: string;
  used: boolean;
}

export default function VersionCollabPage() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [templates, setTemplates] = useState<VisualizationTemplate[]>([]);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [userId] = useState("user_" + Math.random().toString(36).substring(2, 8));

  // Create session
  const createSession = async () => {
    if (!newSessionName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kg/collaboration/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSessionName, created_by: userId }),
      });
      const session = await res.json();
      setSessions((prev) => [...prev, session]);
      setNewSessionName("");
    } catch (error) {
      console.error("Failed to create session:", error);
    }
    setLoading(false);
  };

  // Join session
  const joinSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kg/collaboration/sessions/${sessionId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const session = await res.json();
      setSelectedSession(session);
      loadSessions();
    } catch (error) {
      console.error("Failed to join session:", error);
    }
    setLoading(false);
  };

  // Leave session
  const leaveSession = async (sessionId: string) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/collaboration/sessions/${sessionId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      setSelectedSession(null);
      loadSessions();
    } catch (error) {
      console.error("Failed to leave session:", error);
    }
    setLoading(false);
  };

  // Create invite
  const createInvite = async (sessionId: string, email: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/collaboration/sessions/${sessionId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: email, role: "editor" }),
      });
      return await res.json();
    } catch (error) {
      console.error("Failed to create invite:", error);
      return null;
    }
  };

  // Load sessions
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/collaboration/sessions`);
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, []);

  // Load schedules
  const loadSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/reports/schedule`);
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
    }
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/visualization/templates`);
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadSchedules();
    loadTemplates();
  }, [loadSessions, loadSchedules, loadTemplates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "overview":
        return "📊";
      case "comparison":
        return "🔄";
      case "trend":
        return "📈";
      case "distribution":
        return "📉";
      case "relationship":
        return "🔗";
      default:
        return "📁";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Real-time Collaboration
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate in real-time, schedule reports, and use visualization templates
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v1.42
        </Badge>
      </div>

      <Tabs defaultValue="collab" className="space-y-4">
        <TabsList>
          <TabsTrigger value="collab">Collaboration Sessions</TabsTrigger>
          <TabsTrigger value="reports">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Visualization Templates</TabsTrigger>
        </TabsList>

        {/* Collaboration Sessions Tab */}
        <TabsContent value="collab">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Create Session */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Create Session</CardTitle>
                <CardDescription>Start a new collaboration session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    placeholder="Enter session name"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createSession()}
                  />
                </div>
                <Button onClick={createSession} disabled={loading || !newSessionName.trim()} className="w-full">
                  Create Session
                </Button>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>Your User ID</Label>
                  <Input value={userId} disabled className="font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">
                    Share this ID with collaborators
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Join or manage collaboration sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {sessions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No active sessions. Create one to start collaborating.
                      </p>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.session_id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{session.name}</span>
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {session.participants.length} participant(s) • Created by {session.created_by}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {selectedSession?.session_id === session.session_id ? (
                              <Button variant="destructive" size="sm" onClick={() => leaveSession(session.session_id)}>
                                Leave
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => joinSession(session.session_id)}>
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Selected Session Details */}
            {selectedSession && (
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Session: {selectedSession.name}</CardTitle>
                  <CardDescription>
                    Session ID: {selectedSession.session_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Participants</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSession.participants.map((p) => (
                          <Badge key={p} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Session Info</h4>
                      <p className="text-sm text-muted-foreground">
                        Status: {selectedSession.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(selectedSession.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Schedules</CardTitle>
                <CardDescription>Manage scheduled report generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {schedules.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No scheduled reports configured.
                      </p>
                    ) : (
                      schedules.map((schedule) => (
                        <div
                          key={schedule.schedule_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{schedule.name}</span>
                            <p className="text-sm text-muted-foreground">
                              {schedule.frequency} • {schedule.report_type} • {schedule.format}
                            </p>
                          </div>
                          <Badge variant={schedule.enabled ? "default" : "secondary"}>
                            {schedule.enabled ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Report scheduling overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-3xl font-bold">{schedules.length}</div>
                    <p className="text-sm text-muted-foreground">Total Schedules</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-3xl font-bold">
                      {schedules.filter((s) => s.enabled).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-3xl font-bold">
                      {schedules.filter((s) => s.last_run).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Run This Period</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-3xl font-bold">
                      {schedules.filter((s) => !s.enabled).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Paused</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visualization Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Overview Template</CardTitle>
                <CardDescription>High-level graph overview</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <Button variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparison Template</CardTitle>
                <CardDescription>Compare versions side-by-side</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl mb-2">🔄</div>
                <Button variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend Template</CardTitle>
                <CardDescription>Show temporal trends</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <Button variant="outline" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            {templates.map((template) => (
              <Card key={template.template_id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl mb-2">{getCategoryIcon(template.category)}</div>
                  <Badge variant="outline">{template.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}