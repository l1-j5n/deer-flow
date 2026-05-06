"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CopyIcon,
  FileTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XIcon,
  DownloadIcon,
  SearchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDocument, getDocumentDownloadUrl } from "@/core/knowledge-base";
import type { DocumentMeta } from "@/core/knowledge-base";

interface ChunkData {
  idx: number;
  text: string;
  charCount: number;
  page?: number;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  code: "Code",
  documentation: "Docs",
  data: "Data",
  research: "Research",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  code: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  documentation: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  data: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  research: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  other: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export default function DocumentViewerDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: DocumentMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeChunk, setActiveChunk] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Search state ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [matchResults, setMatchResults] = useState<
    Array<{ chunkIdx: number; matchIndex: number; text: string }>
  >([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (chunks.length > 0) return;

    setLoading(true);
    getDocument(doc.id)
      .then((detail) => {
        if (detail) setChunks(detail.chunks);
      })
      .finally(() => setLoading(false));
  }, [open, doc.id, chunks.length]);

  // ── Ctrl+F keyboard shortcut ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // ── Search logic ────────────────────────────────────────────────
  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim() || chunks.length === 0) {
        setMatchResults([]);
        setCurrentMatchIndex(0);
        return;
      }
      const lowerQuery = query.toLowerCase();
      const results: Array<{ chunkIdx: number; matchIndex: number; text: string }> = [];
      chunks.forEach((chunk) => {
        let searchIdx = 0;
        let idx = chunk.text.toLowerCase().indexOf(lowerQuery, searchIdx);
        while (idx !== -1) {
          const start = Math.max(0, idx - 20);
          const end = Math.min(chunk.text.length, idx + lowerQuery.length + 20);
          results.push({
            chunkIdx: chunk.idx,
            matchIndex: idx,
            text: (start > 0 ? "..." : "") + chunk.text.slice(start, end) + (end < chunk.text.length ? "..." : ""),
          });
          searchIdx = idx + 1;
          idx = chunk.text.toLowerCase().indexOf(lowerQuery, searchIdx);
        }
      });
      setMatchResults(results);
      setCurrentMatchIndex(results.length > 0 ? 0 : -1);
    },
    [chunks],
  );

  const navigateMatch = useCallback(
    (direction: "next" | "prev") => {
      if (matchResults.length === 0) return;
      setCurrentMatchIndex((prev) => {
        if (direction === "next") return (prev + 1) % matchResults.length;
        return (prev - 1 + matchResults.length) % matchResults.length;
      });
    },
    [matchResults.length],
  );

  // Scroll to current match
  useEffect(() => {
    if (currentMatchIndex >= 0 && matchResults.length > 0) {
      const match = matchResults[currentMatchIndex];
      if (match) scrollToChunk(match.chunkIdx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMatchIndex]);

  // ── Highlight helper ────────────────────────────────────────────
  function highlightMatches(text: string, query: string, activeMatchIndex?: number): React.ReactNode {
    if (!query.trim()) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let idx = lowerText.indexOf(lowerQuery, lastIndex);
    while (idx !== -1) {
      if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
      const isActive = activeMatchIndex !== undefined && activeMatchIndex === idx;
      parts.push(
        <mark
          key={idx}
          className={`rounded-sm px-0.5 ${
            isActive ? "bg-amber-400 text-black" : "bg-yellow-200/50 dark:bg-yellow-800/40"
          }`}
        >
          {text.slice(idx, idx + query.length)}
        </mark>
      );
      lastIndex = idx + query.length;
      idx = lowerText.indexOf(lowerQuery, lastIndex);
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length > 0 ? <>{parts}</> : text;
  }

  const fullText = chunks.map((c) => c.text).join("\n\n");
  const catColor = CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.general;
  const catLabel = CATEGORY_LABELS[doc.category] ?? doc.category;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const url = getDocumentDownloadUrl(doc.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
  };

  const scrollToChunk = (chunkIdx: number) => {
    const el = document.getElementById(`chunk-view-${chunkIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveChunk(chunkIdx);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileTextIcon className="size-5" />
            {doc.title || doc.filename}
          </DialogTitle>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              {doc.fileType}
            </Badge>
            {doc.pageCount && (
              <Badge variant="secondary" className="text-xs">
                {doc.pageCount} pages
              </Badge>
            )}
            <Badge className={`text-xs ${catColor}`}>{catLabel}</Badge>
            {doc.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            <span className="text-muted-foreground text-xs">
              {doc.chunkCount} chunks · {doc.charCount.toLocaleString()} chars · {formatSize(doc.fileSize)}
            </span>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs"
              >
                {copied ? (
                  <CheckIcon className="size-3.5 mr-1 text-green-500" />
                ) : (
                  <CopyIcon className="size-3.5 mr-1" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-7 text-xs"
              >
                <DownloadIcon className="size-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {/* Search bar */}
          {showSearch && (
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2 top-1.5 size-3.5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    performSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      navigateMatch(e.shiftKey ? "prev" : "next");
                    }
                    if (e.key === "Escape") {
                      setShowSearch(false);
                      setSearchQuery("");
                      setMatchResults([]);
                    }
                  }}
                  placeholder="Search in document… (Ctrl+F)"
                  className="h-8 w-full rounded-md border bg-background pl-7 pr-20 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="absolute right-1 top-1 flex items-center gap-0.5">
                  {matchResults.length > 0 && (
                    <span className="text-muted-foreground text-[10px] tabular-nums mr-1">
                      {currentMatchIndex + 1}/{matchResults.length}
                    </span>
                  )}
                  <button
                    onClick={() => navigateMatch("prev")}
                    className="size-5 rounded p-0.5 hover:bg-muted text-muted-foreground"
                    disabled={matchResults.length === 0}
                  >
                    <ChevronLeftIcon className="size-3" />
                  </button>
                  <button
                    onClick={() => navigateMatch("next")}
                    className="size-5 rounded p-0.5 hover:bg-muted text-muted-foreground"
                    disabled={matchResults.length === 0}
                  >
                    <ChevronRightIcon className="size-3" />
                  </button>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                      setMatchResults([]);
                    }}
                    className="size-5 rounded p-0.5 hover:bg-muted text-muted-foreground"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chunk navigation tabs */}
          {chunks.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2">
              <Label className="text-muted-foreground shrink-0 text-xs">
                Chunks:
              </Label>
              {chunks.map((chunk) => (
                <button
                  key={chunk.idx}
                  onClick={() => scrollToChunk(chunk.idx)}
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                    activeChunk === chunk.idx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  #{chunk.idx + 1}
                </button>
              ))}
              <span className="text-muted-foreground ml-1 text-xs">
                — click to jump
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Content area */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : chunks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileTextIcon className="text-muted-foreground/40 mb-2 size-8" />
              <p className="text-muted-foreground text-sm">No content to display</p>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] rounded-md border">
              <div className="p-6">
                {chunks.map((chunk) => (
                  <div
                    key={chunk.idx}
                    id={`chunk-view-${chunk.idx}`}
                    className={`mb-4 rounded-lg border p-4 transition-all ${
                      activeChunk === chunk.idx ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium">
                        Chunk {chunk.idx + 1} of {chunks.length}
                        {chunk.page && ` · Page ${chunk.page}`}
                      </span>
                      <span>{chunk.charCount} chars</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {searchQuery.trim()
                        ? highlightMatches(
                            chunk.text,
                            searchQuery,
                            matchResults[currentMatchIndex]?.chunkIdx === chunk.idx
                              ? matchResults[currentMatchIndex]?.matchIndex
                              : undefined,
                          )
                        : chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground shrink-0">
          <span>Filename: {doc.filename}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-7"
          >
            <XIcon className="size-3.5 mr-1" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
