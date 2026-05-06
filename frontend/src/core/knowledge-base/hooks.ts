import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  batchDeleteDocuments,
  batchUpdateDocuments,
  deleteDocument,
  getDocument,
  getEmbeddingStatus,
  getKBStats,
  hybridSearchKnowledgeBase,
  listDocuments,
  listTags,
  reindexDocument,
  reindexKnowledgeBase,
  searchKnowledgeBase,
  updateDocumentMetadata,
  uploadDocument,
  getDocumentRelatedEntities,
} from "./api";
import type {
  BatchDeleteRequest,
  BatchUpdateRequest,
  DocumentUpdateRequest,
  HybridSearchRequest,
  SearchRequest,
} from "./types";

const KEYS = {
  all: ["knowledge-base"] as const,
  documents: () => [...KEYS.all, "documents"] as const,
  document: (id: string) => [...KEYS.all, "document", id] as const,
  stats: () => [...KEYS.all, "stats"] as const,
  tags: () => [...KEYS.all, "tags"] as const,
  search: (query: string) => [...KEYS.all, "search", query] as const,
};

export function useKBStats() {
  return useQuery({
    queryKey: KEYS.stats(),
    queryFn: () => getKBStats(),
    refetchInterval: 30_000,
  });
}

export function useKBDocuments(
  fileType?: string,
  category?: string,
  tag?: string,
  search?: string,
) {
  return useQuery({
    queryKey: [...KEYS.documents(), fileType, category, tag, search],
    queryFn: () => listDocuments(fileType, category, tag, search),
  });
}

export function useKBDocument(docId: string) {
  return useQuery({
    queryKey: KEYS.document(docId),
    queryFn: () => getDocument(docId),
    enabled: !!docId,
  });
}

export function useDocumentRelatedEntities(docId: string) {
  return useQuery({
    queryKey: [...KEYS.all, "related-entities", docId] as const,
    queryFn: () => getDocumentRelatedEntities(docId),
    enabled: !!docId,
    staleTime: 30_000,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      title,
      linkToGraph,
      tags,
      category,
    }: {
      file: File;
      title?: string;
      linkToGraph?: boolean;
      tags?: string[];
      category?: string;
    }) => uploadDocument(file, title, linkToGraph, tags, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents() });
      qc.invalidateQueries({ queryKey: KEYS.stats() });
      qc.invalidateQueries({ queryKey: KEYS.tags() });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => deleteDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents() });
      qc.invalidateQueries({ queryKey: KEYS.stats() });
      qc.invalidateQueries({ queryKey: KEYS.tags() });
    },
  });
}

export function useUpdateDocumentMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      req,
    }: {
      docId: string;
      req: DocumentUpdateRequest;
    }) => updateDocumentMetadata(docId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents() });
      qc.invalidateQueries({ queryKey: KEYS.stats() });
      qc.invalidateQueries({ queryKey: KEYS.tags() });
    },
  });
}

export function useTags() {
  return useQuery({
    queryKey: KEYS.tags(),
    queryFn: () => listTags(),
    refetchInterval: 60_000,
  });
}

export function useSearchKB() {
  return useMutation({
    mutationFn: (req: SearchRequest) => searchKnowledgeBase(req),
  });
}

export function useReindexDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => reindexDocument(docId),
    onSuccess: (_data, docId) => {
      qc.invalidateQueries({ queryKey: KEYS.document(docId) });
      qc.invalidateQueries({ queryKey: KEYS.documents() });
      qc.invalidateQueries({ queryKey: KEYS.stats() });
    },
  });
}

export function useReindexKB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reindexKnowledgeBase(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.stats() });
    },
  });
}

// ── Hybrid Search ────────────────────────────────────────────────

export function useHybridSearchKB() {
  return useMutation({
    mutationFn: (req: HybridSearchRequest) => hybridSearchKnowledgeBase(req),
  });
}

// ── Embedding Status ─────────────────────────────────────────────

export function useEmbeddingStatus() {
  return useQuery({
    queryKey: [...KEYS.all, "embedding-status"] as const,
    queryFn: () => getEmbeddingStatus(),
    refetchInterval: 60_000,
  });
}

// ── Batch Operations ─────────────────────────────────────────────

export function useBatchDeleteDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BatchDeleteRequest) => batchDeleteDocuments(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents() });
      qc.invalidateQueries({ queryKey: KEYS.stats() });
      qc.invalidateQueries({ queryKey: KEYS.tags() });
    },
  });
}

export function useBatchUpdateDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BatchUpdateRequest) => batchUpdateDocuments(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents() });
      qc.invalidateQueries({ queryKey: KEYS.stats() });
      qc.invalidateQueries({ queryKey: KEYS.tags() });
    },
  });
}
