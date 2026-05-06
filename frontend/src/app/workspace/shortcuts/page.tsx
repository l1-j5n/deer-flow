"use client";

import { useState, useMemo } from "react";
import {
  CommandIcon,
  CornerDownLeftIcon,
  KeyboardIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useShortcuts, useUpdateShortcut, useResetShortcuts } from "@/core/shortcuts";
import type { Shortcut } from "@/core/shortcuts";

/** Convert Electron accelerator (CmdOrCtrl+N) to browser-style key combo (Ctrl+N) */
function electronAccelToKeyCombo(accel: string): string {
  return accel
    .replace(/CmdOrCtrl/g, "Ctrl")
    .replace(/Command/g, "Ctrl")
    .replace(/Meta/g, "Cmd")
    .replace(/\+/g, "+");
}

/** Convert browser-style key combo (Ctrl+N) to Electron accelerator (CmdOrCtrl+N) */
function keyComboToElectronAccel(combo: string): string {
  return combo
    .replace(/^Ctrl\+/, "CmdOrCtrl+")
    .replace(/^Alt\+/, "Alt+")
    .replace(/^Shift\+/, "Shift+")
    .replace(/^Cmd\+/, "CmdOrCtrl+");
}

function parseKeyCombo(combo: string): string[] {
  return combo.split("+").map((k) => k.trim());
}

function formatKeyCombo(keys: string[]): string {
  return keys.join("+");
}

function KeyBadge({ keyName }: { keyName: string }) {
  const isModifier = ["Ctrl", "Alt", "Shift", "Cmd", "Meta"].includes(keyName);
  return (
    <kbd
      className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-mono font-medium ${
        isModifier
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground border border-border"
      }`}
    >
      {keyName}
    </kbd>
  );
}

function ShortcutCombo({ combo }: { combo: string }) {
  const keys = parseKeyCombo(combo);
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={i} className="flex items-center gap-1">
          <KeyBadge keyName={key} />
          {i < keys.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
        </span>
      ))}
    </div>
  );
}

export default function ShortcutsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [recordingKeys, setRecordingKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const { data, isLoading, error } = useShortcuts({ search: searchQuery || undefined, category: selectedCategory === "all" ? undefined : selectedCategory });
  const updateMutation = useUpdateShortcut();
  const resetMutation = useResetShortcuts();

  const shortcuts = useMemo(() => data?.shortcuts ?? [], [data]);
  const categories = useMemo(() => {
    const cats = new Set<string>(["all"]);
    shortcuts.forEach((s) => cats.add(s.category));
    return Array.from(cats);
  }, [shortcuts]);

  const filtered = useMemo(() => {
    if (!searchQuery && selectedCategory === "all") return shortcuts;
    return shortcuts.filter((s) => {
      const matchesSearch =
        searchQuery.toLowerCase() === "" ||
        s.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.keyCombo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [shortcuts, searchQuery, selectedCategory]);

  const handleEdit = (shortcut: Shortcut) => {
    setEditingShortcut(shortcut);
    setRecordingKeys(parseKeyCombo(shortcut.keyCombo));
    setIsRecording(false);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingShortcut || recordingKeys.length === 0) return;
    const newCombo = formatKeyCombo(recordingKeys);
    try {
      await updateMutation.mutateAsync({ id: editingShortcut.id, keyCombo: newCombo });
    } catch {
      // Error handled by mutation
    }
    setEditDialogOpen(false);
    setEditingShortcut(null);
    setRecordingKeys([]);
  };

  const handleReset = async (shortcut: Shortcut) => {
    try {
      await updateMutation.mutateAsync({ id: shortcut.id, keyCombo: shortcut.defaultKeyCombo });
    } catch {
      // Error handled by mutation
    }
  };

  const handleResetAll = async () => {
    try {
      await resetMutation.mutateAsync();
    } catch {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    e.preventDefault();
    const keys: string[] = [];
    if (e.ctrlKey) keys.push("Ctrl");
    if (e.altKey) keys.push("Alt");
    if (e.shiftKey) keys.push("Shift");
    if (e.metaKey) keys.push("Cmd");
    if (e.key && !["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    }
    if (keys.length > 0) {
      setRecordingKeys(keys);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyboardIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Keyboard Shortcuts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetAll} disabled={resetMutation.isPending}>
            <RefreshCwIcon className={`size-4 mr-2 ${resetMutation.isPending ? "animate-spin" : ""}`} />
            Reset All
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <CommandIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            placeholder="Search shortcuts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              className="text-xs capitalize"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Shortcuts List */}
      <Card>
        <CardHeader>
          <CardTitle>Shortcuts</CardTitle>
          <CardDescription>
            {filtered.length} of {shortcuts.length} shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <XIcon className="text-destructive mb-4 size-12" />
              <p className="text-destructive">Failed to load shortcuts: {String(error)}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <KeyboardIcon className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground">No shortcuts found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{shortcut.action}</span>
                      {shortcut.isCustom && (
                        <Badge variant="outline" className="text-[10px]">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{shortcut.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShortcutCombo combo={shortcut.keyCombo} />
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleEdit(shortcut)}
                        title="Edit"
                      >
                        <PlusIcon className="size-3" />
                      </Button>
                      {shortcut.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => handleReset(shortcut)}
                          title="Reset to default"
                          disabled={updateMutation.isPending}
                        >
                          <RefreshCwIcon className={`size-3 ${updateMutation.isPending ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md" onKeyDown={handleKeyDown}>
          <DialogHeader>
            <DialogTitle>Edit Shortcut</DialogTitle>
            <DialogDescription>
              {editingShortcut?.action} — Press the key combination you want to use
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div
              className={`flex min-h-[80px] items-center justify-center rounded-lg border-2 border-dashed p-4 ${
                isRecording ? "border-primary bg-primary/5" : "border-muted"
              }`}
              onClick={() => setIsRecording(true)}
              tabIndex={0}
              role="button"
            >
              {recordingKeys.length > 0 ? (
                <div className="flex items-center gap-2">
                  {recordingKeys.map((key, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <KeyBadge keyName={key} />
                      {i < recordingKeys.length - 1 && (
                        <PlusIcon className="size-3 text-muted-foreground" />
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {isRecording ? "Press keys..." : "Click to record"}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRecording(!isRecording);
                  if (isRecording) {
                    setRecordingKeys([]);
                  }
                }}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecordingKeys([])}
                disabled={recordingKeys.length === 0}
              >
                <XIcon className="size-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={recordingKeys.length === 0 || updateMutation.isPending}>
              <SaveIcon className="size-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}