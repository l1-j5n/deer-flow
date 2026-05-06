import { getBackendBaseURL } from "@/core/config";
import type {
  BatchDeleteRequest,
  BatchDeleteResponse,
  BatchUpdateRequest,
  BatchUpdateResponse,
  DocumentMeta,
  DocumentDetail,
  DocumentListResponse,
  DocumentUpdateRequest,
  EmbeddingStatus,
  HybridSearchRequest,
  HybridSearchResponse,
  KBStats,
  SearchRequest,
  SearchResponse,
  TagsResponse,
  RelatedEntity,
} from "./types";

const BASE = `/api/electron/kb`;

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `KB API error: ${res.status}`);
  }
  return res.json();
}

async function fetchJsonSafe(path: string, init?: RequestInit): Promise<unknown | null> {
  try {
    return await fetchJson(path, init);
  } catch {
    return null;
  }
}

// ── Document operations ──────────────────────────────────────────────

export async function uploadDocument(
  file: File,
  title?: string,
  linkToGraph = true,
  tags?: string[],
  category?: string,
): Promise<DocumentMeta> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (title) params.set("title", title);
  params.set("linkToGraph", String(linkToGraph));
  if (tags && tags.length > 0) params.set("tags", tags.join(","));
  if (category) params.set("category", category);
  const qs = params.toString();

  return (await fetchJson(`${BASE}/documents?${qs}`, {
    method: "POST",
    body: formData,
  })) as DocumentMeta;
}

export async function listDocuments(
  fileType?: string,
  category?: string,
  tag?: string,
  search?: string,
  limit = 100,
): Promise<DocumentListResponse> {
  const params = new URLSearchParams();
  if (fileType) params.set("fileType", fileType);
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);
  if (search) params.set("search", search);
  params.set("limit", String(limit));
  const qs = params.toString();
  return (await fetchJson(`${BASE}/documents?${qs}`)) as DocumentListResponse;
}

export async function getDocument(docId: string): Promise<DocumentDetail | null> {
  return (await fetchJsonSafe(`${BASE}/documents/${encodeURIComponent(docId)}`)) as DocumentDetail | null;
}

export async function deleteDocument(docId: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/documents/${encodeURIComponent(docId)}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

export function getDocumentDownloadUrl(docId: string): string {
  return `${getBackendBaseURL()}${BASE}/documents/${encodeURIComponent(docId)}/download`;
}

export async function getDocumentRelatedEntities(docId: string): Promise<RelatedEntity[]> {
  const data = await fetchJsonSafe(`${BASE}/documents/${encodeURIComponent(docId)}/related-entities`);
  return (data ?? []) as RelatedEntity[];
}

export async function downloadDocument(docId: string, filename: string): Promise<boolean> {
  try {
    const url = getDocumentDownloadUrl(docId);
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    return true;
  } catch {
    return false;
  }
}

export async function batchDeleteDocuments(
  req: BatchDeleteRequest,
): Promise<BatchDeleteResponse | null> {
  return (await fetchJsonSafe(`${BASE}/documents/batch-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })) as BatchDeleteResponse | null;
}

export async function batchUpdateDocuments(
  req: BatchUpdateRequest,
): Promise<BatchUpdateResponse | null> {
  return (await fetchJsonSafe(`${BASE}/documents/batch-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })) as BatchUpdateResponse | null;
}

export async function updateDocumentMetadata(
  docId: string,
  req: DocumentUpdateRequest,
): Promise<DocumentMeta> {
  return (await fetchJson(`${BASE}/documents/${encodeURIComponent(docId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })) as DocumentMeta;
}

// ── Tags & Categories ─────────────────────────────────────────────

export async function listTags(): Promise<TagsResponse> {
  return (await fetchJson(`${BASE}/tags`)) as TagsResponse;
}

// ── Search ───────────────────────────────────────────────────────────

export async function searchKnowledgeBase(req: SearchRequest): Promise<SearchResponse> {
  return (await fetchJson(`${BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })) as SearchResponse;
}

// ── Hybrid Search ───────────────────────────────────────────────

export async function hybridSearchKnowledgeBase(
  req: HybridSearchRequest,
): Promise<HybridSearchResponse> {
  return (await fetchJson(`${BASE}/search/hybrid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })) as HybridSearchResponse;
}

// ── Embedding Status ─────────────────────────────────────────────

export async function getEmbeddingStatus(): Promise<EmbeddingStatus | null> {
  return (await fetchJsonSafe(`${BASE}/embeddings/status`)) as EmbeddingStatus | null;
}

// ── Stats & Reindex ──────────────────────────────────────────────────

export async function getKBStats(): Promise<KBStats | null> {
  return (await fetchJsonSafe(`${BASE}/stats`)) as KBStats | null;
}

export async function reindexDocument(docId: string): Promise<DocumentMeta> {
  return (await fetchJson(`${BASE}/documents/${encodeURIComponent(docId)}/reindex`, {
    method: "POST",
  })) as DocumentMeta;
}

export async function reindexKnowledgeBase(): Promise<{ success: boolean; indexedVectors: number; message: string }> {
  return (await fetchJson(`${BASE}/reindex`, { method: "POST" })) as {
    success: boolean; indexedVectors: number; message: string;
  };
}
