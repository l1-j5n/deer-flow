"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "";

interface GraphEvent {
  event_id: string;
  event_type: string;
  entity_id: string | null;
  relation_id: string | null;
  data: Record<string, unknown> | null;
  timestamp: number;
}

interface NotificationMessage {
  notification_id: string;
  title: string;
  message: string;
  severity: string;
  entity_id: string | null;
  timestamp: number;
}

interface StreamStats {
  total: number;
  by_type: Record<string, number>;
}

export default function StreamingDashboardPage() {
  const [events, setEvents] = useState<GraphEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [streamStats, setStreamStats] = useState<StreamStats | null>(null);
  const [recentChanges, setRecentChanges] = useState<Record<string, unknown> | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [newEventType, setNewEventType] = useState("entity_added");
  const [newEntityId, setNewEntityId] = useState("");
  const [newEventData, setNewEventData] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    loadEvents();
    loadStreamStats();
    return () => {
      disconnectWebSocket();
      disconnectSSE();
    };
  }, []);

  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/stream/events?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to load events:", e);
    }
  };

  const loadStreamStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/stream/events/count`);
      if (res.ok) {
        const data = await res.json();
        setStreamStats(data);
      }
    } catch (e) {
      console.error("Failed to load stream stats:", e);
    }
  };

  const loadChanges = async (since: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/stream/changes?since=${since}`);
      if (res.ok) {
        const data = await res.json();
        setRecentChanges(data);
      }
    } catch (e) {
      console.error("Failed to load changes:", e);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current) return;

    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/api/knowledge-graph/stream/ws`
    );

    ws.onopen = () => {
      setWsConnected(true);
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents((prev) => [data, ...prev].slice(0, 100));
      } catch (e) {
        console.error("Failed to parse WS message:", e);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      wsRef.current = null;
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsConnected(false);
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) return;

    const eventSource = new EventSource(
      `${API_BASE}/api/knowledge-graph/stream/sse`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setEvents((prev) => [data, ...prev].slice(0, 100));
      } catch (e) {
        console.error("Failed to parse SSE:", e);
      }
    };

    eventSourceRef.current = eventSource;
  };

  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const toggleLiveMode = () => {
    if (liveMode) {
      disconnectWebSocket();
      disconnectSSE();
    } else {
      connectWebSocket();
      connectSSE();
    }
    setLiveMode(!liveMode);
  };

  const createEvent = async () => {
    try {
      const data: Record<string, unknown> = {};
      if (newEventData) {
        try {
          const parsed = JSON.parse(newEventData);
          Object.assign(data, parsed);
        } catch {
          data["raw"] = newEventData;
        }
      }

      const res = await fetch(`${API_BASE}/api/knowledge-graph/stream/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: newEventType,
          entity_id: newEntityId || null,
          data: Object.keys(data).length ? data : null,
        }),
      });

      if (res.ok) {
        loadEvents();
        setNewEntityId("");
        setNewEventData("");
      }
    } catch (e) {
      console.error("Failed to create event:", e);
    }
  };

  const publishNotification = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/notifications/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Test Notification",
          message: "This is a test notification",
          severity: "info",
        }),
      });

      if (res.ok) {
        console.log("Notification published");
      }
    } catch (e) {
      console.error("Failed to publish notification:", e);
    }
  };

  const exportEvents = async (format: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/stream/export?format=${format}`);
      if (res.ok) {
        const data = await res.json();
        if (format === "json") {
          const blob = new Blob([JSON.stringify(data.events, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `stream-events-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (e) {
      console.error("Failed to export:", e);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      entity_added: "bg-green-500",
      entity_updated: "bg-blue-500",
      entity_deleted: "bg-red-500",
      relation_added: "bg-purple-500",
      relation_updated: "bg-yellow-500",
      relation_deleted: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Graph Streaming</h1>
          <p className="text-muted-foreground">
            Monitor and stream graph events in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={liveMode ? "destructive" : "default"}
            onClick={toggleLiveMode}
          >
            {liveMode ? "Stop Live" : "Start Live"}
          </Button>
          <Badge variant={wsConnected ? "default" : "secondary"}>
            {wsConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graph Events</CardTitle>
              <CardDescription>
                Recent events from the graph stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {events.length === 0 ? (
                    <p className="text-muted-foreground">No events yet</p>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.event_id}
                        className="flex items-center gap-2 p-2 rounded border"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${getEventTypeColor(
                            event.event_type
                          )}`}
                        />
                        <span className="font-mono text-sm">
                          {event.event_type}
                        </span>
                        {event.entity_id && (
                          <Badge variant="outline">{event.entity_id}</Badge>
                        )}
                        <span className="text-muted-foreground text-sm ml-auto">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => loadEvents()}>
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportEvents("json")}
                >
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportEvents("csv")}
                >
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Counts</CardTitle>
              </CardHeader>
              <CardContent>
                {streamStats ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {streamStats.total}
                    </div>
                    <div className="text-muted-foreground">Total events</div>
                    <div className="mt-4 space-y-2">
                      {Object.entries(streamStats.by_type).map(([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="font-mono text-sm">{type}</span>
                          <Badge>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No statistics</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Stream Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        wsConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span>WebSocket: {wsConnected ? "Connected" : "Disconnected"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        eventSourceRef.current ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span>SSE: {eventSourceRef.current ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="mt-4">
                    <Button onClick={() => loadChanges(Date.now() / 1000 - 3600)}>
                      Load Last Hour Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
              <CardDescription>
                Manually create a graph event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event Type</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded"
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                  >
                    <option value="entity_added">Entity Added</option>
                    <option value="entity_updated">Entity Updated</option>
                    <option value="entity_deleted">Entity Deleted</option>
                    <option value="relation_added">Relation Added</option>
                    <option value="relation_updated">Relation Updated</option>
                    <option value="relation_deleted">Relation Deleted</option>
                  </select>
                </div>
                <div>
                  <Label>Entity ID (optional)</Label>
                  <Input
                    value={newEntityId}
                    onChange={(e) => setNewEntityId(e.target.value)}
                    placeholder="entity-123"
                  />
                </div>
              </div>
              <div>
                <Label>Additional Data (JSON)</Label>
                <Input
                  value={newEventData}
                  onChange={(e) => setNewEventData(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createEvent}>Create Event</Button>
                <Button variant="outline" onClick={publishNotification}>
                  Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Entity Monitor</CardTitle>
              <CardDescription>
                Monitor specific entities for changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter entity ID to monitor"
                  id="monitor-entity-id"
                />
                <Button
                  onClick={() => {
                    const id = (
                      document.getElementById(
                        "monitor-entity-id"
                      ) as HTMLInputElement
                    ).value;
                    if (id) {
                      fetch(
                        `${API_BASE}/api/knowledge-graph/stream/monitor/${id}`
                      )
                        .then((r) => r.json())
                        .then((data) => console.log(data));
                    }
                  }}
                >
                  Monitor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}