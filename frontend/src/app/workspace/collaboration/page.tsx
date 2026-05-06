"use client";

import { useEffect, useState } from "react";
import { listSessions, getSession, createSession, addCollaborator as addCollaboratorApi, removeCollaborator as removeCollaboratorApi } from "@/core/collaboration";
import {
  CheckCircle2Icon,
  ClockIcon,
  MessageSquareIcon,
  PauseIcon,
  PlayIcon,
  UsersIcon,
  XCircleIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
  BotIcon,
  SendIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CollaborationSession {
  id: string;
  title: string;
  goal: string;
  status: string;
  collaborators: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  messages: Array<{
    id: string;
    from: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
}

type AgentRole = "coordinator" | "researcher" | "critic" | "executor" | "synthesizer" | "specialist";

const ROLE_LABELS: Record<AgentRole, string> = {
  coordinator: "Coordinator",
  researcher: "Researcher",
  critic: "Critic",
  executor: "Executor",
  synthesizer: "Synthesizer",
  specialist: "Specialist",
};

const ROLE_COLORS: Record<AgentRole, string> = {
  coordinator: "bg-blue-500",
  researcher: "bg-green-500",
  critic: "bg-orange-500",
  executor: "bg-purple-500",
  synthesizer: "bg-pink-500",
  specialist: "bg-cyan-500",
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    forming: { color: "bg-blue-500", icon: <ClockIcon className="size-3" /> },
    active: { color: "bg-green-500", icon: <PlayIcon className="size-3" /> },
    consensus: { color: "bg-purple-500", icon: <CheckCircle2Icon className="size-3" /> },
    conflict: { color: "bg-orange-500", icon: <XCircleIcon className="size-3" /> },
    completed: { color: "bg-green-600", icon: <CheckCircle2Icon className="size-3" /> },
    failed: { color: "bg-red-500", icon: <XCircleIcon className="size-3" /> },
  };
  const config = variants[status] ?? variants.forming;
  if (!config) return null;
  return (
    <Badge className={`${config.color} text-white flex items-center gap-1`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function CollaboratorBadge({ role, name }: { role: string; name: string }) {
  const color = ROLE_COLORS[role as AgentRole] ?? "bg-slate-500";
  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1">
      <span className={`size-2 rounded-full ${color}`} />
      <span className="capitalize">{role}</span>: {name}
    </Badge>
  );
}

// ============================================================
// Create Session Dialog
// ============================================================

function CreateSessionDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [collaborators, setCollaborators] = useState<
    Array<{ name: string; role: AgentRole; capabilities: string }>
  >([{ name: "", role: "coordinator" as AgentRole, capabilities: "" }]);
  const [creating, setCreating] = useState(false);

  const addCollaborator = () => {
    setCollaborators([...collaborators, { name: "", role: "researcher" as AgentRole, capabilities: "" }]);
  };

  const removeCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const updateCollaborator = (
    index: number,
    field: keyof (typeof collaborators)[0],
    value: string
  ) => {
    const updated = [...collaborators];
    updated[index] = { ...updated[index], [field]: value } as { name: string; role: AgentRole; capabilities: string };
    setCollaborators(updated);
  };

  const handleCreate = async () => {
    if (!title.trim() || !goal.trim()) return;
    setCreating(true);
    try {
      const session = await createSession(title, goal);
      if (session) {
        for (const c of collaborators) {
          if (c.name.trim()) {
            await addCollaboratorApi(
              session.id,
              c.name,
              c.role,
              c.capabilities.split(",").map((s) => s.trim()).filter(Boolean)
            );
          }
        }
      }
      setOpen(false);
      setTitle("");
      setGoal("");
      setCollaborators([{ name: "", role: "coordinator", capabilities: "" }]);
      onCreated();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  const isValid = title.trim() && goal.trim() && collaborators.some((c) => c.name.trim());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4 mr-2" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Collaboration Session</DialogTitle>
          <DialogDescription>
            Set up a multi-agent collaboration session with a goal and team of agents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="e.g., Research Project Alpha"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              placeholder="What should the team accomplish?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Collaborators</Label>
              <Button variant="outline" size="sm" onClick={addCollaborator}>
                <PlusIcon className="size-3 mr-1" />
                Add
              </Button>
            </div>
            {collaborators.map((c, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Agent name"
                    value={c.name}
                    onChange={(e) => updateCollaborator(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={c.role}
                    onValueChange={(v) => updateCollaborator(i, "role", v as AgentRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {collaborators.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => removeCollaborator(i)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Capabilities (comma-separated)"
                  value={c.capabilities}
                  onChange={(e) => updateCollaborator(i, "capabilities", e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!isValid || creating}>
            {creating ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Add Collaborator Dialog
// ============================================================

function AddCollaboratorDialog({
  sessionId,
  onAdded,
}: {
  sessionId: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("researcher");
  const [capabilities, setCapabilities] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await addCollaboratorApi(
        sessionId,
        name,
        role,
        capabilities.split(",").map((s) => s.trim()).filter(Boolean)
      );
      setOpen(false);
      setName("");
      setRole("researcher");
      setCapabilities("");
      onAdded();
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="size-3 mr-1" />
          Add Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
          <DialogDescription>Add a new agent to this session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name</Label>
            <Input
              id="agent-name"
              placeholder="Agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AgentRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="caps">Capabilities</Label>
            <Input
              id="caps"
              placeholder="Comma-separated capabilities"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim() || adding}>
            {adding ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function CollaborationPage() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null);

  const fetchSessions = async () => {
    try {
      const list = await listSessions();
      setSessions(list ?? []);
      if (list?.length > 0 && !selectedSession) {
        setSelectedSession(list[0] ?? null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const refreshSession = async () => {
    if (!selectedSession) return;
    try {
      const updated = await getSession(selectedSession.id);
      if (updated) {
        setSelectedSession(updated);
        setSessions((prev) =>
          prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Agent Collaboration</h1>
        </div>
        <CreateSessionDialog onCreated={fetchSessions} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground">No collaboration sessions yet.</p>
            <div className="mt-4">
              <CreateSessionDialog onCreated={fetchSessions} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Session List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Sessions</h2>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${
                  selectedSession?.id === session.id ? "border-primary bg-muted" : ""
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{session.title}</span>
                  <StatusBadge status={session.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                  {session.goal}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UsersIcon className="size-3" />
                    {session.collaborators.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2Icon className="size-3" />
                    {session.tasks.filter((t) => t.status === "completed").length}/
                    {session.tasks.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquareIcon className="size-3" />
                    {session.messages.length}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Session Detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSession ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedSession.title}</CardTitle>
                        <CardDescription className="mt-1">{selectedSession.goal}</CardDescription>
                      </div>
                      <StatusBadge status={selectedSession.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Collaborators</h3>
                        <AddCollaboratorDialog
                          sessionId={selectedSession.id}
                          onAdded={refreshSession}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSession.collaborators.map((c) => (
                          <CollaboratorBadge key={c.id} role={c.role} name={c.name} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-semibold">Tasks</h3>
                      <div className="space-y-2">
                        {selectedSession.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between rounded border p-2 text-sm"
                          >
                            <span>{task.title}</span>
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "default"
                                  : task.status === "running"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                        {selectedSession.tasks.length === 0 && (
                          <p className="text-muted-foreground text-sm">No tasks yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquareIcon className="size-5" />
                      Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 space-y-3 overflow-y-auto">
                    {selectedSession.messages.map((msg) => (
                      <div key={msg.id} className="rounded-lg border p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-medium">{msg.from}</span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                    {selectedSession.messages.length === 0 && (
                      <p className="text-muted-foreground text-sm">No messages yet.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Select a session to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
