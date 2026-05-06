/**
 * DeerFlow Electron - Knowledge Graph Manager
 *
 * Manages a local knowledge graph for the agent platform:
 * - Entity extraction and storage
 * - Relationship mapping between entities
 * - Graph querying and traversal
 * - Semantic search over graph nodes
 * - Graph visualization data export
 * - Integration with context manager for entity retrieval
 *
 * Stores data in JSON files under .deerflow/knowledge-graph/
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export interface KnowledgeEntity {
  id: string;
  name: string;
  type: string; // e.g., "person", "organization", "concept", "technology"
  aliases: string[];
  description?: string;
  properties: Record<string, any>;
  source?: string; // Where this entity was extracted from
  confidence: number; // 0-1
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessed: string;
}

export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string; // e.g., "works_for", "created", "related_to", "part_of"
  properties: Record<string, any>;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  source?: string;
}

export interface KnowledgeGraph {
  entities: KnowledgeEntity[];
  relations: KnowledgeRelation[];
  version: number;
  updatedAt: string;
}

export interface EntityQuery {
  name?: string;
  type?: string | string[];
  search?: string;
  limit?: number;
  minConfidence?: number;
}

export interface RelationQuery {
  sourceId?: string;
  targetId?: string;
  type?: string;
  entityId?: string; // Any relation involving this entity
  limit?: number;
}

export interface GraphPath {
  nodes: KnowledgeEntity[];
  edges: KnowledgeRelation[];
  distance: number;
}

export interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
  averageConfidence: number;
  orphanedEntities: number; // Entities with no relations
  mostConnected: Array<{ entityId: string; name: string; connectionCount: number }>;
  typeDistribution: Record<string, number>;
}

// ============================================================
// Knowledge Graph Manager
// ============================================================

const KG_DIR = "knowledge-graph";
const KG_FILE = "knowledge-graph.json";
const MAX_ENTITIES = 10000;
const MAX_RELATIONS = 50000;

export class KnowledgeGraphManager extends EventEmitter {
  private projectRoot: string;
  private kgDir: string;
  private entities: Map<string, KnowledgeEntity> = new Map();
  private relations: Map<string, KnowledgeRelation> = new Map();
  private entityNameIndex: Map<string, Set<string>> = new Map(); // name -> entity IDs
  private entityTypeIndex: Map<string, Set<string>> = new Map(); // type -> entity IDs
  private relationIndex: Map<string, Set<string>> = new Map(); // entityId -> relation IDs
  private dirty = false;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.kgDir = path.join(projectRoot, ".deerflow", KG_DIR);
    this.ensureDirectories();
    this.loadGraph();
    this.startAutoSave();
  }

  // ============================================================
  // Entity Management
  // ============================================================

  /**
   * Add or update an entity
   */
  addEntity(entity: Omit<KnowledgeEntity, "id" | "createdAt" | "updatedAt" | "accessCount" | "lastAccessed">): KnowledgeEntity {
    const now = new Date().toISOString();

    // Check for existing entity by name + type
    const existing = this.findEntityByName(entity.name, entity.type);
    if (existing) {
      // Merge properties
      existing.aliases = [...new Set([...existing.aliases, ...(entity.aliases || [])])];
      existing.description = entity.description || existing.description;
      existing.properties = { ...existing.properties, ...entity.properties };
      existing.confidence = Math.max(existing.confidence, entity.confidence || 0.5);
      existing.source = entity.source || existing.source;
      existing.updatedAt = now;
      this.dirty = true;
      this.emit("entity:updated", existing);
      return existing;
    }

    const newEntity: KnowledgeEntity = {
      ...entity,
      id: this.generateId("ent"),
      aliases: entity.aliases || [],
      properties: entity.properties || {},
      confidence: entity.confidence || 0.5,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      lastAccessed: now,
    };

    this.entities.set(newEntity.id, newEntity);
    this.indexEntity(newEntity);
    this.dirty = true;

    // Enforce max entities limit
    if (this.entities.size > MAX_ENTITIES) {
      this.pruneOldestEntities();
    }

    this.emit("entity:added", newEntity);
    return newEntity;
  }

  /**
   * Get an entity by ID
   */
  getEntity(id: string): KnowledgeEntity | null {
    const entity = this.entities.get(id);
    if (entity) {
      entity.accessCount++;
      entity.lastAccessed = new Date().toISOString();
    }
    return entity || null;
  }

  /**
   * Find entity by name (exact or alias match)
   */
  findEntityByName(name: string, type?: string): KnowledgeEntity | null {
    const lowerName = name.toLowerCase();
    const ids = this.entityNameIndex.get(lowerName);
    if (!ids) return null;

    for (const id of ids) {
      const entity = this.entities.get(id);
      if (entity) {
        if (!type || entity.type === type) return entity;
      }
    }
    return null;
  }

  /**
   * Search entities
   */
  searchEntities(query: EntityQuery): KnowledgeEntity[] {
    let results = Array.from(this.entities.values());

    if (query.name) {
      const lower = query.name.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          e.aliases.some((a) => a.toLowerCase().includes(lower))
      );
    }

    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      results = results.filter((e) => types.includes(e.type));
    }

    if (query.search) {
      const lower = query.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          e.aliases.some((a) => a.toLowerCase().includes(lower)) ||
          (e.description && e.description.toLowerCase().includes(lower))
      );
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((e) => e.confidence >= query.minConfidence!);
    }

    // Sort by relevance (access count + confidence)
    results.sort((a, b) => {
      const scoreA = a.accessCount * 0.3 + a.confidence * 0.7;
      const scoreB = b.accessCount * 0.3 + b.confidence * 0.7;
      return scoreB - scoreA;
    });

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Update an entity
   */
  updateEntity(id: string, updates: Partial<Omit<KnowledgeEntity, "id" | "createdAt">>): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    Object.assign(entity, updates, { updatedAt: new Date().toISOString() });
    this.dirty = true;
    this.emit("entity:updated", entity);
    return true;
  }

  /**
   * Delete an entity and its relations
   */
  deleteEntity(id: string): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    // Remove related relations
    const relationIds = this.relationIndex.get(id);
    if (relationIds) {
      for (const relId of relationIds) {
        this.relations.delete(relId);
      }
      this.relationIndex.delete(id);
    }

    // Remove from name index
    const lowerName = entity.name.toLowerCase();
    const nameSet = this.entityNameIndex.get(lowerName);
    if (nameSet) {
      nameSet.delete(id);
      if (nameSet.size === 0) this.entityNameIndex.delete(lowerName);
    }

    // Remove from type index
    const typeSet = this.entityTypeIndex.get(entity.type);
    if (typeSet) {
      typeSet.delete(id);
      if (typeSet.size === 0) this.entityTypeIndex.delete(entity.type);
    }

    this.entities.delete(id);
    this.dirty = true;
    this.emit("entity:deleted", id);
    return true;
  }

  // ============================================================
  // Relation Management
  // ============================================================

  /**
   * Add a relation between two entities
   */
  addRelation(relation: Omit<KnowledgeRelation, "id" | "createdAt" | "updatedAt">): KnowledgeRelation | null {
    // Validate entities exist
    if (!this.entities.has(relation.sourceId) || !this.entities.has(relation.targetId)) {
      return null;
    }

    // Check for duplicate
    const existing = this.findRelation(relation.sourceId, relation.targetId, relation.type);
    if (existing) {
      existing.properties = { ...existing.properties, ...relation.properties };
      existing.confidence = Math.max(existing.confidence, relation.confidence || 0.5);
      existing.updatedAt = new Date().toISOString();
      this.dirty = true;
      return existing;
    }

    const newRelation: KnowledgeRelation = {
      ...relation,
      id: this.generateId("rel"),
      properties: relation.properties || {},
      confidence: relation.confidence || 0.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.relations.set(newRelation.id, newRelation);
    this.indexRelation(newRelation);
    this.dirty = true;

    if (this.relations.size > MAX_RELATIONS) {
      this.pruneOldestRelations();
    }

    this.emit("relation:added", newRelation);
    return newRelation;
  }

  /**
   * Get a relation by ID
   */
  getRelation(id: string): KnowledgeRelation | null {
    return this.relations.get(id) || null;
  }

  /**
   * Find relation between entities
   */
  findRelation(sourceId: string, targetId: string, type: string): KnowledgeRelation | null {
    const sourceRels = this.relationIndex.get(sourceId);
    if (!sourceRels) return null;

    for (const relId of sourceRels) {
      const rel = this.relations.get(relId);
      if (rel && rel.sourceId === sourceId && rel.targetId === targetId && rel.type === type) {
        return rel;
      }
    }
    return null;
  }

  /**
   * Query relations
   */
  queryRelations(query: RelationQuery): KnowledgeRelation[] {
    let results = Array.from(this.relations.values());

    if (query.sourceId) {
      results = results.filter((r) => r.sourceId === query.sourceId);
    }
    if (query.targetId) {
      results = results.filter((r) => r.targetId === query.targetId);
    }
    if (query.type) {
      results = results.filter((r) => r.type === query.type);
    }
    if (query.entityId) {
      results = results.filter((r) => r.sourceId === query.entityId || r.targetId === query.entityId);
    }
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get neighbors of an entity
   */
  getNeighbors(entityId: string): Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation; direction: "out" | "in" }> {
    const results: Array<{ entity: KnowledgeEntity; relation: KnowledgeRelation; direction: "out" | "in" }> = [];
    const relationIds = this.relationIndex.get(entityId);
    if (!relationIds) return results;

    for (const relId of relationIds) {
      const rel = this.relations.get(relId);
      if (!rel) continue;

      if (rel.sourceId === entityId) {
        const target = this.entities.get(rel.targetId);
        if (target) results.push({ entity: target, relation: rel, direction: "out" });
      } else {
        const source = this.entities.get(rel.sourceId);
        if (source) results.push({ entity: source, relation: rel, direction: "in" });
      }
    }

    return results;
  }

  /**
   * Delete a relation
   */
  deleteRelation(id: string): boolean {
    const relation = this.relations.get(id);
    if (!relation) return false;

    // Remove from index
    const sourceSet = this.relationIndex.get(relation.sourceId);
    if (sourceSet) sourceSet.delete(id);
    const targetSet = this.relationIndex.get(relation.targetId);
    if (targetSet) targetSet.delete(id);

    this.relations.delete(id);
    this.dirty = true;
    this.emit("relation:deleted", id);
    return true;
  }

  // ============================================================
  // Graph Traversal
  // ============================================================

  /**
   * Find paths between two entities (BFS)
   */
  findPaths(sourceId: string, targetId: string, maxDepth: number = 3): GraphPath[] {
    const paths: GraphPath[] = [];
    const visited = new Set<string>();

    interface QueueItem {
      entityId: string;
      nodes: KnowledgeEntity[];
      edges: KnowledgeRelation[];
      depth: number;
    }

    const queue: QueueItem[] = [{
      entityId: sourceId,
      nodes: [this.entities.get(sourceId)!].filter(Boolean),
      edges: [],
      depth: 0,
    }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.entityId === targetId && current.depth > 0) {
        paths.push({
          nodes: current.nodes,
          edges: current.edges,
          distance: current.depth,
        });
        continue;
      }

      if (current.depth >= maxDepth) continue;

      const neighbors = this.getNeighbors(current.entityId);
      for (const { entity, relation } of neighbors) {
        if (visited.has(`${current.entityId}-${entity.id}`)) continue;
        visited.add(`${current.entityId}-${entity.id}`);

        queue.push({
          entityId: entity.id,
          nodes: [...current.nodes, entity],
          edges: [...current.edges, relation],
          depth: current.depth + 1,
        });
      }
    }

    return paths.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get subgraph around an entity
   */
  getSubgraph(centerId: string, depth: number = 2): { entities: KnowledgeEntity[]; relations: KnowledgeRelation[] } {
    const entitySet = new Set<string>([centerId]);
    const relationSet = new Set<string>();
    let currentLayer = new Set<string>([centerId]);

    for (let d = 0; d < depth; d++) {
      const nextLayer = new Set<string>();
      for (const entityId of currentLayer) {
        const neighbors = this.getNeighbors(entityId);
        for (const { entity, relation } of neighbors) {
          entitySet.add(entity.id);
          relationSet.add(relation.id);
          nextLayer.add(entity.id);
        }
      }
      currentLayer = nextLayer;
    }

    return {
      entities: Array.from(entitySet).map((id) => this.entities.get(id)!).filter(Boolean),
      relations: Array.from(relationSet).map((id) => this.relations.get(id)!).filter(Boolean),
    };
  }

  // ============================================================
  // Statistics & Export
  // ============================================================

  getStats(): GraphStats {
    const entities = Array.from(this.entities.values());
    const relations = Array.from(this.relations.values());

    const entityTypes: Record<string, number> = {};
    const relationTypes: Record<string, number> = {};
    const connectionCounts: Record<string, number> = {};

    for (const e of entities) {
      entityTypes[e.type] = (entityTypes[e.type] || 0) + 1;
      connectionCounts[e.id] = 0;
    }

    for (const r of relations) {
      relationTypes[r.type] = (relationTypes[r.type] || 0) + 1;
      connectionCounts[r.sourceId] = (connectionCounts[r.sourceId] || 0) + 1;
      connectionCounts[r.targetId] = (connectionCounts[r.targetId] || 0) + 1;
    }

    const mostConnected = Object.entries(connectionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([entityId, count]) => ({
        entityId,
        name: this.entities.get(entityId)?.name || "Unknown",
        connectionCount: count,
      }));

    const orphanedEntities = entities.filter((e) => !connectionCounts[e.id]).length;
    const avgConfidence = entities.length > 0
      ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
      : 0;

    return {
      totalEntities: entities.length,
      totalRelations: relations.length,
      entityTypes,
      relationTypes,
      averageConfidence: avgConfidence,
      orphanedEntities,
      mostConnected,
      typeDistribution: entityTypes,
    };
  }

  /**
   * Export graph for visualization (Cytoscape.js format)
   */
  exportForVisualization(): { nodes: any[]; edges: any[] } {
    const nodes = Array.from(this.entities.values()).map((e) => ({
      data: {
        id: e.id,
        label: e.name,
        type: e.type,
        confidence: e.confidence,
        description: e.description,
      },
    }));

    const edges = Array.from(this.relations.values()).map((r) => ({
      data: {
        id: r.id,
        source: r.sourceId,
        target: r.targetId,
        label: r.type,
        confidence: r.confidence,
      },
    }));

    return { nodes, edges };
  }

  /**
   * Export full graph
   */
  exportGraph(): KnowledgeGraph {
    return {
      entities: Array.from(this.entities.values()),
      relations: Array.from(this.relations.values()),
      version: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Import full graph
   */
  importGraph(graph: KnowledgeGraph): { success: boolean; imported: number } {
    let imported = 0;

    for (const entity of graph.entities) {
      this.entities.set(entity.id, entity);
      this.indexEntity(entity);
      imported++;
    }

    for (const relation of graph.relations) {
      this.relations.set(relation.id, relation);
      this.indexRelation(relation);
      imported++;
    }

    this.dirty = true;
    this.saveGraph();
    return { success: true, imported };
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.kgDir)) {
      fs.mkdirSync(this.kgDir, { recursive: true });
    }
  }

  private getGraphPath(): string {
    return path.join(this.kgDir, KG_FILE);
  }

  private loadGraph(): void {
    try {
      const graphPath = this.getGraphPath();
      if (!fs.existsSync(graphPath)) return;

      const graph: KnowledgeGraph = JSON.parse(fs.readFileSync(graphPath, "utf-8"));

      for (const entity of graph.entities) {
        this.entities.set(entity.id, entity);
        this.indexEntity(entity);
      }

      for (const relation of graph.relations) {
        this.relations.set(relation.id, relation);
        this.indexRelation(relation);
      }

      console.log(`[KnowledgeGraph] Loaded ${this.entities.size} entities, ${this.relations.size} relations`);
    } catch (err) {
      console.warn("[KnowledgeGraph] Failed to load graph:", err);
    }
  }

  private saveGraph(): void {
    if (!this.dirty) return;
    try {
      const graphPath = this.getGraphPath();
      const graph = this.exportGraph();
      fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2), "utf-8");
      this.dirty = false;
    } catch (err) {
      console.warn("[KnowledgeGraph] Failed to save graph:", err);
    }
  }

  private startAutoSave(): void {
    this.saveTimer = setInterval(() => {
      if (this.dirty) this.saveGraph();
    }, 30000); // Auto-save every 30s
  }

  // ============================================================
  // Indexing
  // ============================================================

  private indexEntity(entity: KnowledgeEntity): void {
    // Name index
    const lowerName = entity.name.toLowerCase();
    if (!this.entityNameIndex.has(lowerName)) {
      this.entityNameIndex.set(lowerName, new Set());
    }
    this.entityNameIndex.get(lowerName)!.add(entity.id);

    // Alias index
    for (const alias of entity.aliases) {
      const lowerAlias = alias.toLowerCase();
      if (!this.entityNameIndex.has(lowerAlias)) {
        this.entityNameIndex.set(lowerAlias, new Set());
      }
      this.entityNameIndex.get(lowerAlias)!.add(entity.id);
    }

    // Type index
    if (!this.entityTypeIndex.has(entity.type)) {
      this.entityTypeIndex.set(entity.type, new Set());
    }
    this.entityTypeIndex.get(entity.type)!.add(entity.id);
  }

  private indexRelation(relation: KnowledgeRelation): void {
    for (const entityId of [relation.sourceId, relation.targetId]) {
      if (!this.relationIndex.has(entityId)) {
        this.relationIndex.set(entityId, new Set());
      }
      this.relationIndex.get(entityId)!.add(relation.id);
    }
  }

  // ============================================================
  // Pruning
  // ============================================================

  private pruneOldestEntities(): void {
    const sorted = Array.from(this.entities.values())
      .sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime());

    const toRemove = sorted.slice(0, Math.floor(MAX_ENTITIES * 0.1));
    for (const entity of toRemove) {
      this.deleteEntity(entity.id);
    }
  }

  private pruneOldestRelations(): void {
    const sorted = Array.from(this.relations.values())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const toRemove = sorted.slice(0, Math.floor(MAX_RELATIONS * 0.1));
    for (const relation of toRemove) {
      this.deleteRelation(relation.id);
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveGraph();
    this.removeAllListeners();
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
