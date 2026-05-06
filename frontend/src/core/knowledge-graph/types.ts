/** Knowledge Graph type definitions. */

export interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  aliases: string[];
  description?: string;
  properties: Record<string, unknown>;
  source?: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessed: string;
}

export interface CreateEntityInput {
  name: string;
  type: string;
  aliases?: string[];
  description?: string;
  properties?: Record<string, unknown>;
  source?: string;
  confidence?: number;
}

export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, unknown>;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  source?: string;
}

export interface CreateRelationInput {
  sourceId: string;
  targetId: string;
  type: string;
  properties?: Record<string, unknown>;
  confidence?: number;
  source?: string;
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
  entityId?: string;
  limit?: number;
}

export interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
  averageConfidence: number;
  orphanedEntities: number;
  mostConnected: Array<{
    entityId: string;
    name: string;
    connectionCount: number;
  }>;
}

export interface VizGraph {
  nodes: Array<{
    data: {
      id: string;
      label: string;
      type: string;
      confidence: number;
    };
  }>;
  edges: Array<{
    data: {
      id: string;
      source: string;
      target: string;
      label: string;
      confidence: number;
    };
  }>;
}
