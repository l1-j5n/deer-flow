"use client";

import { useCallback, useRef, useState } from "react";
import {
  BookOpenIcon,
  BrainIcon,
  FileTextIcon,
  SearchIcon,
  UploadIcon,
  Trash2Icon,
  RefreshCwIcon,
  DatabaseIcon,
  XIcon,
  ExternalLinkIcon,
  FileIcon,
  FileCodeIcon,
  FileJsonIcon,
  SparklesIcon,
  PencilIcon,
  TagIcon,
  CheckIcon,
  CheckSquareIcon,
  SquareIcon,
  EyeIcon,
  DownloadIcon,
  NetworkIcon,
  LayersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useKBDocuments,
  useKBStats,
  useUploadDocument,
  useDeleteDocument,
  useHybridSearchKB,
  useEmbeddingStatus,
  useReindexKB,
  useReindexDocument,
  useTags,
  useUpdateDocumentMetadata,
  useBatchDeleteDocuments,
  useBatchUpdateDocuments,
  useDocumentRelatedEntities,
  getDocumentDownloadUrl,
} from "@/core/knowledge-base";
import { useI18n } from "@/core/i18n/hooks";
import type { DocumentMeta, HybridSearchResult, EmbeddingStatus, TagItem } from "@/core/knowledge-base";
import DocumentViewerDialog from "./document-viewer-dialog";

// ── File type icon mapping ───────────────────────────────────────────

function FileTypeIcon({ type }: { type: string }) {
  const cls = "size-4";
  switch (type) {
    case ".md":
      return <FileTextIcon className={cls} />;
    case ".py":
    case ".js":
    case ".ts":
    case ".css":
    case ".html":
      return <FileCodeIcon className={cls} />;
    case ".json":
    case ".yaml":
    case ".yml":
      return <FileJsonIcon className={cls} />;
    case ".pdf":
      return <FileTextIcon className={cls} />;
    default:
      return <FileIcon className={cls} />;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Category labels ────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Categories",
  general: "General",
  code: "Code",
  documentation: "Documentation",
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

// ── Upload Form ──────────────────────────────────────────────────────

function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("general");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocument();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  }, [title]);

  const handleSubmit = async () => {
    if (!file) return;
    const tagList = tags.split(",").map(s => s.trim()).filter(Boolean);
    await upload.mutateAsync({ file, title: title || undefined, tags: tagList, category });
    setFile(null);
    setTitle("");
    setTags("");
    setCategory("general");
    if (fileRef.current) fileRef.current.value = "";
    onUploaded();
  };

  const kb = t.knowledgeBase;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UploadIcon className="size-5" />
          {kb.upload.title}
        </CardTitle>
        <CardDescription>{kb.upload.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileIcon className="size-10 text-primary" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground text-sm">{formatSize(file.size)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <XIcon className="size-4 mr-1" />
                  {kb.upload.remove}
                </Button>
              </div>
            ) : (
              <>
                <UploadIcon className="text-muted-foreground mb-3 size-10" />
                <p className="text-muted-foreground text-sm">{kb.upload.dragDrop}</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".txt,.md,.pdf,.docx,.py,.js,.ts,.json,.html,.css,.yaml,.yml,.xml,.csv,.log,.rst"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
                }
              }}
            />
          </div>

          <div className="flex gap-3">
            <Input
              placeholder={kb.upload.placeholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== "all").map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={kb.tags.addTagHint}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSubmit} disabled={!file || upload.isPending}>
              {upload.isPending ? (
                <RefreshCwIcon className="size-4 mr-2 animate-spin" />
              ) : (
                <UploadIcon className="size-4 mr-2" />
              )}
              {kb.upload.uploadButton}
            </Button>
          </div>

          {upload.error && (
            <p className="text-destructive text-sm">{(upload.error as Error).message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Hybrid Search Panel ────────────────────────────────────────────

type SearchMode = "hybrid" | "tfidf" | "embeddings";

function HybridSearchPanel({ embeddingStatus }: { embeddingStatus: EmbeddingStatus | null }) {
  const { t } = useI18n();
  const kb = t.knowledgeBase;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HybridSearchResult[]>([]);
  const [queryTime, setQueryTime] = useState(0);
  const [searchMode, setSearchMode] = useState<SearchMode>("hybrid");
  const [alpha, setAlpha] = useState(0.6);
  const search = useHybridSearchKB();

  const hasEmbeddings = embeddingStatus?.available ?? false;
  const effectiveMode: SearchMode = hasEmbeddings ? searchMode : "tfidf";

  const effectiveAlpha =
    effectiveMode === "tfidf" ? 0.0 :
    effectiveMode === "embeddings" ? 1.0 :
    alpha;

  const handleSearch = async () => {
    if (!query.trim()) return;
    const res = await search.mutateAsync({
      query: query.trim(),
      topK: 15,
      alpha: effectiveAlpha,
    });
    setResults(res.results);
    setQueryTime(res.queryTimeMs);
  };

  const modeLabel = (m: SearchMode): string => {
    switch (m) {
      case "tfidf": return kb.search.modeTfidf;
      case "embeddings": return hasEmbeddings ? "Embeddings" : "Emb.";
      case "hybrid": return kb.search.modeHybrid;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {hasEmbeddings ? (
              <SparklesIcon className="size-5 text-amber-500" />
            ) : (
              <SearchIcon className="size-5" />
            )}
            {kb.search.title}
            {hasEmbeddings && (
              <Badge variant="outline" className="ml-1 border-amber-500/50 text-amber-600 text-[10px]">
                {kb.search.aiPowered}
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 text-xs">
            <button
              onClick={() => setSearchMode("tfidf")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                effectiveMode === "tfidf"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {kb.search.modeTfidf}
            </button>
            <button
              onClick={() => setSearchMode("hybrid")}
              disabled={!hasEmbeddings}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                effectiveMode === "hybrid"
                  ? "bg-background shadow-sm text-foreground"
                  : hasEmbeddings
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/40 cursor-not-allowed"
              }`}
            >
              {kb.search.modeHybrid}
            </button>
            <button
              onClick={() => setSearchMode("embeddings")}
              disabled={!hasEmbeddings}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                effectiveMode === "embeddings"
                  ? "bg-background shadow-sm text-foreground"
                  : hasEmbeddings
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/40 cursor-not-allowed"
              }`}
              title={!hasEmbeddings ? kb.embedding.setKey : undefined}
            >
              {kb.search.modeAi}
            </button>
          </div>
        </div>
        <CardDescription>
          {hasEmbeddings
            ? `Hybrid search: TF-IDF + AI embeddings (${embeddingStatus?.provider}/${embeddingStatus?.model.split("/").pop()})`
            : kb.search.placeholder}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder={hasEmbeddings ? kb.search.placeholderAi : kb.search.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={!query.trim() || search.isPending}>
            {search.isPending ? (
              <RefreshCwIcon className="size-4 mr-2 animate-spin" />
            ) : hasEmbeddings ? (
              <SparklesIcon className="size-4 mr-2" />
            ) : (
              <SearchIcon className="size-4 mr-2" />
            )}
            {kb.search.button}
          </Button>
        </div>

        {effectiveMode === "hybrid" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {kb.search.balance.replace("{mode}", modeLabel("hybrid"))}
              </span>
              <span className="text-xs font-medium tabular-nums">
                {kb.search.tfidfLabel} {((1 - alpha) * 100).toFixed(0)}% / {kb.search.aiLabel} {(alpha * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[10px] w-10 text-right">{kb.search.tfidfLabel}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-slate-300 via-amber-300 to-violet-400 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow"
              />
              <span className="text-muted-foreground text-[10px] w-10">{kb.search.aiLabel}</span>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                {kb.search.results.replace("{count}", String(results.length)).replace("{mode}", modeLabel(effectiveMode))}
              </span>
              <span>{queryTime.toFixed(1)}ms</span>
            </div>
            {results.map((r, i) => (
              <div
                key={`${r.docId}-${r.chunkIdx}-${i}`}
                className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="text-muted-foreground size-3.5" />
                    <span className="text-sm font-medium">{r.docTitle || r.docFilename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(effectiveMode === "hybrid" || effectiveMode === "embeddings") && (
                      <div className="hidden items-center gap-0.5 sm:flex">
                        {r.tfidfScore > 0 && (
                          <div className="flex items-center gap-0.5">
                            <div className="h-3 w-12 overflow-hidden rounded bg-slate-100">
                              <div
                                className="h-full rounded bg-slate-400 transition-all"
                                style={{ width: `${Math.min(r.tfidfScore * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground text-[10px] w-7">
                              T{(r.tfidfScore * 100).toFixed(0)}
                            </span>
                          </div>
                        )}
                        {r.embeddingScore > 0 && (
                          <div className="flex items-center gap-0.5">
                            <div className="h-3 w-12 overflow-hidden rounded bg-violet-50">
                              <div
                                className="h-full rounded bg-violet-400 transition-all"
                                style={{ width: `${Math.min(r.embeddingScore * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground text-[10px] w-8">
                              A{(r.embeddingScore * 100).toFixed(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <Badge
                      variant={r.score > 0.3 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {(r.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {r.preview}
                </p>
              </div>
            ))}
          </div>
        )}

        {search.isSuccess && results.length === 0 && (
          <div className="flex flex-col items-center py-6">
            <SearchIcon className="text-muted-foreground/40 mb-2 size-8" />
            <p className="text-muted-foreground text-sm">{kb.search.noResults}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Edit Document Dialog ───────────────────────────────────────────

function EditDocumentDialog({
  doc,
  open,
  onOpenChange,
  onSaved,
}: {
  doc: DocumentMeta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const kb = t.knowledgeBase;
  const update = useUpdateDocumentMetadata();
  const [title, setTitle] = useState(doc.title);
  const [tags, setTags] = useState(doc.tags?.join(", ") ?? "");
  const [category, setCategory] = useState(doc.category ?? "general");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const tagList = tags.split(",").map(s => s.trim()).filter(Boolean);
    await update.mutateAsync({
      docId: doc.id,
      req: { title: title.trim() || undefined, tags: tagList, category },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilIcon className="size-4" />
            {kb.edit.title}
          </DialogTitle>
          <DialogDescription>{doc.filename}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">{kb.edit.titleLabel}</Label>
            <Input
              id="edit-title"
              placeholder={kb.edit.titlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">{kb.edit.categoryLabel}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== "all").map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tags">{kb.edit.tagsLabel}</Label>
            <Input
              id="edit-tags"
              placeholder={kb.edit.tagsPlaceholder}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {kb.edit.cancel}
          </Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {saved ? (
              <>
                <CheckIcon className="size-4 mr-2 text-green-500" />
                {kb.edit.saved}
              </>
            ) : update.isPending ? (
              <RefreshCwIcon className="size-4 mr-2 animate-spin" />
            ) : null}
            {!saved && kb.edit.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Document List ────────────────────────────────────────────────────

function DocumentList({
  searchQuery,
  selectedCategory,
  selectedTag,
  tagsList,
}: {
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string;
  tagsList: TagItem[];
}) {
  const { t } = useI18n();
  const kb = t.knowledgeBase;
  const { data, isLoading, refetch } = useKBDocuments(
    undefined,
    selectedCategory !== "all" ? selectedCategory : undefined,
    selectedTag || undefined,
  );
  const deleteDoc = useDeleteDocument();
  const batchDelete = useBatchDeleteDocuments();
  const batchUpdate = useBatchUpdateDocuments();
  const [editingDoc, setEditingDoc] = useState<DocumentMeta | null>(null);
  const [showBatchEditDialog, setShowBatchEditDialog] = useState(false);
  const [batchEditTags, setBatchEditTags] = useState("");
  const [batchEditCategory, setBatchEditCategory] = useState("");
  const [batchEditMode, setBatchEditMode] = useState<"set" | "add" | "remove">("set");
  const [viewingDoc, setViewingDoc] = useState<DocumentMeta | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const documents = data?.documents ?? [];
  const filtered = searchQuery
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((d) => d.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDelete.mutateAsync({ ids: Array.from(selectedIds) });
    setSelectedIds(new Set());
    setBatchMode(false);
    refetch();
  };

  const handleBatchEdit = () => {
    setBatchEditTags("");
    setBatchEditCategory("");
    setBatchEditMode("set");
    setShowBatchEditDialog(true);
  };

  const submitBatchEdit = async () => {
    const tagsArray = batchEditTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const hasTags = tagsArray.length > 0;
    const hasCategory = batchEditCategory.trim().length > 0;

    if (!hasTags && !hasCategory) return;

    const result = await batchUpdate.mutateAsync({
      ids: Array.from(selectedIds),
      tags: hasTags ? tagsArray : undefined,
      category: hasCategory ? batchEditCategory.trim().toLowerCase() : undefined,
      mode: batchEditMode,
    });

    if (result?.success) {
      setSelectedIds(new Set());
      setBatchMode(false);
      setShowBatchEditDialog(false);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpenIcon className="text-muted-foreground mb-4 size-12" />
        <p className="text-muted-foreground">
          {documents.length === 0 ? kb.documents.empty : kb.documents.emptySearch}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Batch toggle button (visible outside batch mode) */}
      {!batchMode && (
        <div className="mb-2 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBatchMode(true)}
            className="text-xs h-7"
          >
            <CheckSquareIcon className="size-3.5 mr-1" />
            {kb.documents.batchSelect}
          </Button>
        </div>
      )}

      {/* Batch mode header */}
      {batchMode && (
        <div className="flex items-center gap-2 mb-3 rounded-lg border bg-muted/30 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectAll}
            className="text-xs h-7"
          >
            {selectedIds.size === filtered.length ? (
              <CheckSquareIcon className="size-4 mr-1" />
            ) : (
              <SquareIcon className="size-4 mr-1" />
            )}
            {selectedIds.size === 0
              ? kb.documents.selectAll
              : `${selectedIds.size} ${kb.documents.selected}`}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0 || batchDelete.isPending}
            className="text-xs h-7"
          >
            {batchDelete.isPending ? (
              <RefreshCwIcon className="size-3.5 mr-1 animate-spin" />
            ) : (
              <Trash2Icon className="size-3.5 mr-1" />
            )}
            {kb.documents.batchDelete.replace("{count}", String(selectedIds.size))}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchEdit}
            disabled={selectedIds.size === 0}
            className="text-xs h-7"
          >
            <LayersIcon className="size-3.5 mr-1" />
            {kb.documents.batchUpdate}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setBatchMode(false);
              setSelectedIds(new Set());
            }}
            className="text-xs h-7 ml-auto"
          >
            {kb.documents.cancel}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            tagsList={tagsList}
            batchMode={batchMode}
            selected={selectedIds.has(doc.id)}
            onSelect={() => toggleSelect(doc.id)}
            onView={() => setViewingDoc(doc)}
            onEdit={() => setEditingDoc(doc)}
            onDelete={async () => {
              await deleteDoc.mutateAsync(doc.id);
              refetch();
            }}
            isDeleting={deleteDoc.isPending}
          />
        ))}
      </div>

      {editingDoc && (
        <EditDocumentDialog
          doc={editingDoc}
          open={!!editingDoc}
          onOpenChange={(open) => { if (!open) setEditingDoc(null); }}
          onSaved={() => refetch()}
        />
      )}

      {viewingDoc && (
        <DocumentViewerDialog
          doc={viewingDoc}
          open={!!viewingDoc}
          onOpenChange={(open) => { if (!open) setViewingDoc(null); }}
        />
      )}

      {/* Batch Edit Dialog */}
      <Dialog open={showBatchEditDialog} onOpenChange={setShowBatchEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {kb.documents.batchUpdateTitle.replace("{count}", String(selectedIds.size))}
            </DialogTitle>
            <DialogDescription>
              {kb.documents.batchUpdateModeSet}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{kb.documents.batchUpdateModeSet}</Label>
              <div className="flex gap-2">
                {(["set", "add", "remove"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={batchEditMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBatchEditMode(mode)}
                    className="text-xs h-8"
                  >
                    {mode === "set"
                      ? kb.documents.batchUpdateModeSet
                      : mode === "add"
                        ? kb.documents.batchUpdateModeAdd
                        : kb.documents.batchUpdateModeRemove}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{kb.documents.batchUpdateCategoryLabel}</Label>
              <Select value={batchEditCategory} onValueChange={setBatchEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={kb.documents.batchUpdateCategoryLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- {kb.documents.batchUpdateModeSet} --</SelectItem>
                  {Object.entries(CATEGORY_LABELS)
                    .filter(([k]) => k !== "all")
                    .map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{kb.documents.batchUpdateTagsLabel}</Label>
              <Input
                placeholder={kb.documents.batchUpdateTagsLabel}
                value={batchEditTags}
                onChange={(e) => setBatchEditTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchEditDialog(false)}>
              {kb.documents.cancel}
            </Button>
            <Button
              onClick={submitBatchEdit}
              disabled={batchUpdate.isPending}
            >
              {batchUpdate.isPending && <RefreshCwIcon className="size-3.5 mr-1 animate-spin" />}
              {kb.documents.batchUpdate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DocumentRow({
  doc,
  tagsList,
  batchMode,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  isDeleting,
}: {
  doc: DocumentMeta;
  tagsList: TagItem[];
  batchMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { t } = useI18n();
  const kb = t.knowledgeBase;
  const [expanded, setExpanded] = useState(false);
  const [chunks, setChunks] = useState<Array<{ idx: number; text: string; charCount: number }>>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [showKgEntities, setShowKgEntities] = useState(false);
  const { data: relatedEntities } = useDocumentRelatedEntities(showKgEntities ? doc.id : "");
  const reindexDoc = useReindexDocument();

  const handleReindex = (e: React.MouseEvent) => {
    e.stopPropagation();
    reindexDoc.mutate(doc.id);
  };

  const loadChunks = async () => {
    if (chunks.length > 0) {
      setExpanded(!expanded);
      return;
    }
    setLoadingChunks(true);
    try {
      const { getDocument } = await import("@/core/knowledge-base");
      const detail = await getDocument(doc.id);
      if (detail) {
        setChunks(detail.chunks);
        setExpanded(true);
      }
    } catch {
      // ignore
    } finally {
      setLoadingChunks(false);
    }
  };

  const catColor = CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS["general"];
  const catLabel = CATEGORY_LABELS[doc.category] ?? doc.category;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getDocumentDownloadUrl(doc.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    a.click();
  };

  return (
    <div className={`rounded-lg border transition-colors hover:bg-muted/30 ${selected ? "border-primary bg-primary/5" : ""}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Batch checkbox */}
          {batchMode && (
            <button
              onClick={onSelect}
              className="text-primary shrink-0 hover:scale-110 transition-transform"
            >
              {selected ? (
                <CheckSquareIcon className="size-5" />
              ) : (
                <SquareIcon className="size-5 text-muted-foreground" />
              )}
            </button>
          )}
          <FileTypeIcon type={doc.fileType} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{doc.title}</span>
              <Badge variant="outline" className="text-xs shrink-0">
                {doc.fileType}
              </Badge>
              <Badge className={`text-xs shrink-0 ${catColor}`}>
                {catLabel}
              </Badge>
              {doc.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs shrink-0">
                  <TagIcon className="size-2.5 mr-0.5" />
                  {tag}
                </Badge>
              ))}
              {doc.tags && doc.tags.length > 3 && (
                <span className="text-muted-foreground text-xs">+{doc.tags.length - 3}</span>
              )}
            </div>
            <p className="text-muted-foreground text-xs truncate">{doc.filename}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden text-right sm:block">
            <div className="text-sm">{formatSize(doc.fileSize)}</div>
            <div className="text-muted-foreground text-xs">
              {doc.chunkCount} chunks · {doc.charCount.toLocaleString()} chars
            </div>
          </div>
          <div className="text-muted-foreground hidden text-xs md:block">
            {formatDate(doc.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8" onClick={onView} title="View document">
              <EyeIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={handleDownload} title="Download file">
              <DownloadIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handleReindex}
              disabled={reindexDoc.isPending}
              title={kb.documents.reindexDoc}
            >
              {reindexDoc.isPending && reindexDoc.variables === doc.id ? (
                <RefreshCwIcon className="size-4 animate-spin" />
              ) : (
                <RefreshCwIcon className="size-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={loadChunks} title="View chunks">
              {loadingChunks ? (
                <RefreshCwIcon className="size-4 animate-spin" />
              ) : (
                <ExternalLinkIcon className="size-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={onEdit} title="Edit metadata">
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {expanded && chunks.length > 0 && (
        <div className="border-t px-4 pb-4">
          <p className="text-muted-foreground py-2 text-xs font-medium">
            {kb.documents.chunkLabel.replace("{count}", String(chunks.length))}
          </p>

          {/* Related KG Entities toggle */}
          {!showKgEntities && (
            <button
              onClick={() => setShowKgEntities(true)}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 py-1 mb-2"
            >
              <NetworkIcon className="size-3.5" />
              {kb.documents.relatedEntities || "Related KG Entities"}
            </button>
          )}
          {showKgEntities && relatedEntities !== undefined && (
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-300">
                  {kb.documents.relatedEntities || "Related Knowledge Graph Entities"} ({relatedEntities.length})
                </span>
                <button onClick={() => setShowKgEntities(false)} className="text-indigo-400 hover:text-indigo-200">
                  <XIcon className="size-3" />
                </button>
              </div>
              {relatedEntities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {relatedEntities.map((e) => (
                    <Badge key={e.id} variant="outline" className="text-xs border-indigo-500/30">
                      {e.name}
                      <span className="ml-1 text-indigo-400/60">{(e.confidence * 100).toFixed(0)}%</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No entities linked yet</span>
              )}
            </div>
          )}

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {chunks.map((chunk, i) => (
              <div key={i} className="bg-muted/50 rounded p-3 text-sm">
                <div className="text-muted-foreground mb-1 text-xs">
                  {kb.documents.chunkItem.replace("{n}", String(chunk.idx + 1)).replace("{chars}", String(chunk.charCount))}
                </div>
                <p className="leading-relaxed whitespace-pre-wrap line-clamp-4">{chunk.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Embedding Status Banner ───────────────────────────────────────

function EmbeddingStatusBanner({ status }: { status: EmbeddingStatus | null }) {
  const { t } = useI18n();
  const kb = t.knowledgeBase;

  if (!status) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2 text-sm">
        <RefreshCwIcon className="size-4 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">{kb.embedding.checking}</span>
      </div>
    );
  }

  if (status.available) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm dark:border-green-800 dark:bg-green-950/30">
        <SparklesIcon className="size-4 text-green-600" />
        <span>
          <strong>{kb.embedding.active.replace("{provider}", status.provider)}</strong>
          <span className="text-muted-foreground ml-2">
            {kb.embedding.detail
              .replace("{model}", status.model)
              .replace("{dimension}", String(status.dimension))
              .replace("{chunks}", String(status.embeddedChunks))}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/30">
      <BrainIcon className="size-4 text-amber-600" />
      <span className="flex-1">{status.message || kb.embedding.notConfigured}</span>
      <span className="text-muted-foreground text-xs">
        {kb.embedding.setKey.split("OPENAI_API_KEY").length > 1 ? (
          <>
            Set <code className="rounded bg-amber-200 px-1 dark:bg-amber-900">OPENAI_API_KEY</code> to enable AI search
          </>
        ) : (
          kb.embedding.setKey
        )}
      </span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const { t } = useI18n();
  const kb = t.knowledgeBase;
  const { data: stats } = useKBStats();
  const { data: embeddingStatus } = useEmbeddingStatus();
  const { data: tagsData } = useTags();
  const { refetch: refetchDocs } = useKBDocuments();
  const reindex = useReindexKB();
  const [searchFilter, setSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState("documents");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");

  const tagsList = tagsData?.tags ?? [];
  const categoriesList = tagsData?.categories ?? [];

  // When selectedCategory changes, reset tag filter
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedTag("");
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpenIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{kb.pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reindex.mutate()}
            disabled={reindex.isPending}
          >
            <RefreshCwIcon
              className={`size-4 mr-2 ${reindex.isPending ? "animate-spin" : ""}`}
            />
            {kb.reindex}
          </Button>
        </div>
      </div>

      {/* Embedding Status */}
      <EmbeddingStatusBanner status={embeddingStatus ?? null} />

      {/* Stats */}
      {stats ? (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.documents}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.chunks}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChunks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.totalChars}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalChars > 10000
                  ? `${(stats.totalChars / 1000).toFixed(1)}K`
                  : stats.totalChars}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.avgChunk}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgChunkSize} ch</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.fileTypes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.fileTypes).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.categories}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.categories ?? {}).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{kb.stats.tags}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.tags ?? {}).length}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">
            <DatabaseIcon className="size-4 mr-1" />
            {kb.documents.title}
          </TabsTrigger>
          <TabsTrigger value="upload">
            <UploadIcon className="size-4 mr-1" />
            {kb.upload.title}
          </TabsTrigger>
          <TabsTrigger value="search">
            <SearchIcon className="size-4 mr-1" />
            {kb.search.title}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DatabaseIcon className="size-5" />
                  {kb.documents.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Category filter */}
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-8 w-34 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{kb.categories.all}</SelectItem>
                      {categoriesList.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {CATEGORY_LABELS[c.name] ?? c.name} ({c.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tag filter chips */}
                  {selectedTag && (
                    <Badge
                      variant="default"
                      className="cursor-pointer h-8 gap-1 text-xs"
                      onClick={() => setSelectedTag("")}
                    >
                      {selectedTag}
                      <XIcon className="size-3" />
                    </Badge>
                  )}

                  <div className="relative w-48">
                    <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
                    <Input
                      placeholder={kb.documents.filterPlaceholder}
                      className="pl-8 h-8 text-xs"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <CardDescription>
                {stats
                  ? kb.documents.statsLabel
                      .replace("{total}", String(stats.totalDocuments))
                      .replace("{chunks}", String(stats.totalChunks))
                  : t.common.loading}
              </CardDescription>
            </CardHeader>

            {/* Tag quick-filter bar */}
            {tagsList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-6 pb-2">
                <Badge
                  variant={selectedTag === "" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTag("")}
                >
                  {kb.tags.all}
                </Badge>
                {tagsList.slice(0, 12).map((tag) => (
                  <Badge
                    key={tag.name}
                    variant={selectedTag === tag.name ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedTag(selectedTag === tag.name ? "" : tag.name)}
                  >
                    <TagIcon className="size-2.5 mr-1" />
                    {tag.name}
                    <span className="text-muted-foreground ml-1">({tag.count})</span>
                  </Badge>
                ))}
              </div>
            )}

            <CardContent>
              <DocumentList
                searchQuery={searchFilter}
                selectedCategory={selectedCategory}
                selectedTag={selectedTag}
                tagsList={tagsList}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <UploadForm onUploaded={() => refetchDocs()} />
        </TabsContent>

        <TabsContent value="search">
          <HybridSearchPanel embeddingStatus={embeddingStatus ?? null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
