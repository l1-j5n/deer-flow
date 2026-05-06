/** Conversation Memory type definitions. */

export type MemoryType = "fact" | "preference" | "relationship" | "event" | "concept";

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  content: string;
  confidence: number;
  importance: number;
  sessionId?: string;
  tags: string[];
  relatedMemoryIds: string[];
  sourceSegment?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
  accessCount: number;
}

export interface MemoryStats {
  totalMemories: number;
  byType: Record<string, number>;
  averageConfidence: number;
  averageImportance: number;
  totalTopics: number;
  totalSummaries: number;
}

export interface MemoryQueryParams {
  type?: string;
  search?: string;
  tags?: string;
  minConfidence?: number;
  minImportance?: number;
  sessionId?: string;
  limit?: number;
}

export interface UpdateMemoryRequest {
  content?: string;
  tags?: string[];
  confidence?: number;
  importance?: number;
  relatedMemoryIds?: string[];
}
