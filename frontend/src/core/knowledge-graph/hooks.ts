"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchEntities,
  createEntity,
  getEntity,
  updateEntity,
  deleteEntity,
  queryRelations,
  createRelation,
  getGraphStats,
  exportForVisualization,
  getEntitiesByDocument,
  extractEntities,
  extractAndCreate,
  extractFromSession,
} from "./api";
import type { CreateEntityInput, CreateRelationInput, EntityQuery, KnowledgeEntity } from "./types";

const KG_KEY = "knowledge-graph" as const;

/** Get graph statistics. */
export function useGraphStats() {
  return useQuery({
    queryKey: [KG_KEY, "stats"],
    queryFn: getGraphStats,
    staleTime: 15_000,
  });
}

/** Search / list entities with optional query filters. */
export function useEntities(query: EntityQuery = {}) {
  return useQuery({
    queryKey: [KG_KEY, "entities", query],
    queryFn: () => searchEntities(query),
    staleTime: 10_000,
  });
}

/** Get a single entity by ID. */
export function useEntity(id: string) {
  return useQuery({
    queryKey: [KG_KEY, "entity", id],
    queryFn: () => getEntity(id),
    enabled: !!id,
  });
}

/** Get KG entities linked to a Knowledge Base document. */
export function useEntitiesByDocument(docId: string) {
  return useQuery({
    queryKey: [KG_KEY, "entities-by-doc", docId],
    queryFn: () => getEntitiesByDocument(docId),
    enabled: !!docId,
    staleTime: 30_000,
  });
}

/** Query relations. */
export function useRelations(query: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: [KG_KEY, "relations", query],
    queryFn: () => queryRelations(query),
    staleTime: 10_000,
  });
}

/** Export visualization data. */
export function useVizExport() {
  return useQuery({
    queryKey: [KG_KEY, "viz"],
    queryFn: exportForVisualization,
    staleTime: 30_000,
  });
}

/** Create a new entity. */
export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEntityInput) => createEntity(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}

/** Update an entity. */
export function useUpdateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<KnowledgeEntity> }) =>
      updateEntity(id, updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}

/** Delete an entity. */
export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEntity(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}

/** Create a relation. */
export function useCreateRelation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRelationInput) => createRelation(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}

// ── Extraction hooks ──────────────────────────────────────────────

export interface ExtractTextOptions {
  text: string;
  types?: string[];
  source?: string;
}

/** Extract entities from text (preview, without creating). */
export function useExtractEntities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (options: ExtractTextOptions) => extractEntities(options),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}

/** Extract and create entities in the knowledge graph. */
export function useExtractAndCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (options: ExtractTextOptions) => extractAndCreate(options),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}

/** Extract entities from a session's conversation history. */
export function useExtractFromSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (options: { sessionId: string; types?: string[]; create?: boolean }) =>
      extractFromSession(options.sessionId, options),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KG_KEY] });
    },
  });
}
