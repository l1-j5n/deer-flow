import { getBackendBaseURL } from "@/core/config";
import type {
  CreateEntityInput,
  CreateRelationInput,
  EntityQuery,
  GraphStats,
  KnowledgeEntity,
  KnowledgeRelation,
  RelationQuery,
  VizGraph,
} from "./types";

const BASE = `/api/electron/kg`;

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `KG API error: ${res.status}`);
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

// ── Entity operations ────────────────────────────────────────────────

export async function searchEntities(query: EntityQuery = {}): Promise<KnowledgeEntity[]> {
  try {
    const params = new URLSearchParams();
    if (query.name) params.set("name", query.name);
    if (query.type && typeof query.type === "string") params.set("type", query.type);
    if (query.search) params.set("search", query.search);
    if (query.limit) params.set("limit", String(query.limit));
    if (query.minConfidence) params.set("minConfidence", String(query.minConfidence));
    return (await fetchJson(`${BASE}/entities/search?${params}`)) as KnowledgeEntity[];
  } catch {
    // Fallback: Electron IPC
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return (await api.searchEntities(query)) as KnowledgeEntity[];
    return [];
  }
}

export async function createEntity(input: CreateEntityInput): Promise<KnowledgeEntity | null> {
  try {
    return (await fetchJson(`${BASE}/entities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })) as KnowledgeEntity;
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return (await api.addEntity(input)) as KnowledgeEntity | null;
    return null;
  }
}

export async function getEntity(id: string): Promise<KnowledgeEntity | null> {
  const data = await fetchJsonSafe(`${BASE}/entities/${encodeURIComponent(id)}`);
  if (data) return data as KnowledgeEntity;
  const api = window.electronAPI?.knowledgeGraph;
  if (api) return (await api.getEntity(id)) as KnowledgeEntity | null;
  return null;
}

export async function updateEntity(
  id: string,
  updates: Partial<KnowledgeEntity>,
): Promise<KnowledgeEntity | null> {
  try {
    return (await fetchJson(`${BASE}/entities/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })) as KnowledgeEntity;
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) {
      await api.updateEntity(id, updates);
      return (await api.getEntity(id)) as KnowledgeEntity | null;
    }
    return null;
  }
}

export async function deleteEntity(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/entities/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return api.deleteEntity(id);
    return false;
  }
}

export async function getNeighbors(entityId: string): Promise<
  Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation; direction: "in" | "out" }>
> {
  try {
    return (await fetchJson(`${BASE}/entities/${encodeURIComponent(entityId)}/neighbors`)) as Array<{
      entity: KnowledgeEntity; relation: KnowledgeRelation; direction: "in" | "out";
    }>;
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return (await api.getNeighbors(entityId)) as Array<{
      entity: KnowledgeEntity; relation: KnowledgeRelation; direction: "in" | "out";
    }>;
    return [];
  }
}

export async function getEntitiesByDocument(docId: string): Promise<KnowledgeEntity[]> {
  try {
    return (await fetchJson(`${BASE}/entities/by-doc/${encodeURIComponent(docId)}`)) as KnowledgeEntity[];
  } catch {
    return [];
  }
}

// ── Relation operations ──────────────────────────────────────────────

export async function queryRelations(query: RelationQuery = {}): Promise<KnowledgeRelation[]> {
  try {
    const params = new URLSearchParams();
    if (query.sourceId) params.set("sourceId", query.sourceId);
    if (query.targetId) params.set("targetId", query.targetId);
    if (query.type) params.set("type", query.type);
    if (query.entityId) params.set("entityId", query.entityId);
    if (query.limit) params.set("limit", String(query.limit));
    return (await fetchJson(`${BASE}/relations?${params}`)) as KnowledgeRelation[];
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return (await api.queryRelations(query)) as KnowledgeRelation[];
    return [];
  }
}

export async function createRelation(input: CreateRelationInput): Promise<KnowledgeRelation | null> {
  try {
    return (await fetchJson(`${BASE}/relations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })) as KnowledgeRelation;
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return (await api.addRelation(input)) as KnowledgeRelation | null;
    return null;
  }
}

// ── Stats & Export ──────────────────────────────────────────────────

export async function getGraphStats(): Promise<GraphStats | null> {
  const data = await fetchJsonSafe(`${BASE}/stats`);
  if (data) return data as GraphStats;
  const api = window.electronAPI?.knowledgeGraph;
  if (api) return (await api.getStats()) as unknown as GraphStats;
  return null;
}

export async function exportForVisualization(): Promise<VizGraph> {
  try {
    return (await fetchJson(`${BASE}/export/viz`)) as VizGraph;
  } catch {
    const api = window.electronAPI?.knowledgeGraph;
    if (api) return (await api.exportViz()) as VizGraph;
    return { nodes: [], edges: [] };
  }
}

// ── Entity Extraction ─────────────────────────────────────────────────

export interface ExtractedEntity {
  name: string;
  type: string;
  confidence: number;
  mentions: number;
}

export interface ExtractResponse {
  entities: ExtractedEntity[];
  relations: Array<{ source: string; target: string; type: string }>;
  extractedCount: number;
}

export interface ExtractTextInput {
  text: string;
  types?: string[];
  source?: string;
}

export async function extractEntities(options: ExtractTextInput): Promise<ExtractResponse> {
  const body = {
    text: options.text,
    types: options.types || ["person", "organization", "project", "concept"],
    source: options.source || null,
  };
  try {
    return (await fetchJson(`${BASE}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })) as ExtractResponse;
  } catch {
    return { entities: [], relations: [], extractedCount: 0 };
  }
}

export async function extractAndCreate(options: ExtractTextInput): Promise<ExtractResponse> {
  const body = {
    text: options.text,
    types: options.types || ["person", "organization", "project", "concept"],
    source: options.source || null,
  };
  try {
    return (await fetchJson(`${BASE}/extract-and-create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })) as ExtractResponse;
  } catch {
    return { entities: [], relations: [], extractedCount: 0 };
  }
}

export async function extractFromSession(
  sessionId: string,
  options?: { types?: string[]; create?: boolean }
): Promise<ExtractResponse> {
  const params = new URLSearchParams();
  params.set("session_id", sessionId);
  if (options?.types) params.set("types", options.types.join(","));
  if (options?.create) params.set("create", "true");
  try {
    return (await fetchJson(`${BASE}/extract-session?${params}`)) as ExtractResponse;
  } catch {
    return { entities: [], relations: [], extractedCount: 0 };
  }
}
