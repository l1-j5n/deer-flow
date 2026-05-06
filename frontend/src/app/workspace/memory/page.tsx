"use client";

import { useState } from "react";
import {
  BrainCircuitIcon,
  CalendarIcon,
  ClockIcon,
  Edit3Icon,
  FilterIcon,
  LinkIcon,
  RefreshCwIcon,
  SearchIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  useMemories,
  useMemoryStats,
  useUpdateMemory,
  useDeleteMemory,
} from "@/core/conversation-memory";
import type { MemoryEntry, MemoryType } from "@/core/conversation-memory";

const typeColors: Record<MemoryType, string> = {
  fact: "bg-blue-500",
  preference: "bg-pink-500",
  relationship: "bg-purple-500",
  event: "bg-orange-500",
  concept: "bg-green-500",
};

const typeLabels: Record<MemoryType, string> = {
  fact: "Fact",
  preference: "Preference",
  relationship: "Relationship",
  event: "Event",
  concept: "Concept",
};

function MemoryTypeBadge({ type }: { type: MemoryType }) {
  return (
    <Badge className={`${typeColors[type] ?? "bg-slate-500"} text-white text-xs capitalize`}>
      {typeLabels[type] ?? type}
    </Badge>
  );
}

// ============================================================
// Edit Memory Dialog
// ============================================================

function EditMemoryDialog({
  memory,
  onSaved,
}: {
  memory: MemoryEntry;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(memory.content);
  const [tags, setTags] = useState(memory.tags.join(", "));
  const [confidence, setConfidence] = useState((memory.confidence * 100).toFixed(0));
  const updateMutation = useUpdateMemory();

  const handleSave = async () => {
    const newTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await updateMutation.mutateAsync({
      id: memory.id,
      updates: {
        content,
        tags: newTags,
        confidence: parseInt(confidence, 10) / 100,
      },
    });
    if (result) {
      setOpen(false);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" title="Edit">
          <Edit3Icon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Memory</DialogTitle>
          <DialogDescription>Update the content, tags, and confidence of this memory entry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confidence (0-100)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function MemoryPage() {
  const { data: memories = [], isLoading, refetch } = useMemories();
  const { data: stats } = useMemoryStats();
  const deleteMutation = useDeleteMemory();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MemoryType | "all">("all");

  const handleDelete = async (memoryId: string) => {
    await deleteMutation.mutateAsync(memoryId);
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuitIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Memory Browser</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCwIcon className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Memories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMemories}</div>
              <p className="text-muted-foreground text-xs">{stats.totalTopics} topics</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.averageConfidence * 100).toFixed(0)}%
              </div>
              <p className="text-muted-foreground text-xs">overall</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Importance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.averageImportance * 100).toFixed(0)}%
              </div>
              <p className="text-muted-foreground text-xs">score</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Summaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSummaries}</div>
              <p className="text-muted-foreground text-xs">generated</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            placeholder="Search memories by content or tags..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon className="text-muted-foreground size-4" />
          {(["all", "fact", "preference", "relationship", "event", "concept"] as const).map(
            (t) => (
              <Button
                key={t}
                variant={filterType === t ? "default" : "outline"}
                size="sm"
                className="text-xs capitalize"
                onClick={() => setFilterType(t)}
              >
                {t === "all" ? "All" : typeLabels[t]}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Memory List */}
      <Card>
        <CardHeader>
          <CardTitle>Memories</CardTitle>
          <CardDescription>
            {filteredMemories.length} of {memories.length} memories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BrainCircuitIcon className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground">No memories found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <MemoryTypeBadge type={memory.type} />
                        <Badge
                          variant={memory.confidence > 0.8 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {(memory.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        {memory.importance > 0.8 && (
                          <Badge variant="outline" className="text-xs text-orange-500">
                            High importance
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{memory.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {memory.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <TagIcon className="size-3" />
                            {memory.tags.join(", ")}
                          </span>
                        )}
                        {memory.relatedMemoryIds.length > 0 && (
                          <span className="flex items-center gap-1">
                            <LinkIcon className="size-3" />
                            {memory.relatedMemoryIds.length} linked
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="size-3" />
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="size-3" />
                          Accessed {memory.accessCount}x
                        </span>
                        {memory.sessionId && (
                          <span className="text-muted-foreground">Session: {memory.sessionId}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <EditMemoryDialog memory={memory} onSaved={() => refetch()} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleDelete(memory.id)}
                        title="Delete"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
