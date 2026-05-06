/** Knowledge Base type definitions. */

export interface DocumentMeta {
  id: string;
  filename: string;
  title: string;
  fileType: string;
  fileSize: number;
  chunkCount: number;
  charCount: number;
  pageCount?: number;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends DocumentMeta {
  chunks: Array<{
    idx: number;
    text: string;
    charCount: number;
    page?: number;
    createdAt: string;
  }>;
}

export interface DocumentListResponse {
  documents: DocumentMeta[];
  total: number;
}

export interface SearchRequest {
  query: string;
  topK?: number;
  docId?: string;
  minScore?: number;
}

export interface SearchResult {
  docId: string;
  docTitle: string;
  docFilename: string;
  chunkIdx: number;
  chunkText: string;
  score: number;
  preview: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalChunks: number;
  queryTimeMs: number;
}

export interface KBStats {
  totalDocuments: number;
  totalChunks: number;
  totalChars: number;
  fileTypes: Record<string, number>;
  indexedVectors: number;
  avgChunkSize: number;
  categories: Record<string, number>;
  tags: Record<string, number>;
}

export interface DocumentUpdateRequest {
  title?: string;
  tags?: string[];
  category?: string;
}

export interface TagItem {
  name: string;
  count: number;
}

export interface TagsResponse {
  tags: TagItem[];
  categories: TagItem[];
}

// ── Hybrid Search ────────────────────────────────────────────────

export interface HybridSearchRequest {
  query: string;
  topK?: number;
  docId?: string;
  alpha?: number;   // 0.0=TF-IDF, 0.6=balanced, 1.0=embeddings
  minScore?: number;
}

export interface HybridSearchResult {
  docId: string;
  docTitle: string;
  docFilename: string;
  chunkIdx: number;
  chunkText: string;
  score: number;          // hybrid score
  tfidfScore: number;     // TF-IDF component
  embeddingScore: number; // embedding component
  preview: string;
}

export interface HybridSearchResponse {
  results: HybridSearchResult[];
  totalChunks: number;
  queryTimeMs: number;
  searchMode: string;  // "hybrid" | "tfidf_only" | "embedding_only"
  alpha: number;
}

export interface EmbeddingStatus {
  provider: string;
  model: string;
  dimension: number;
  available: boolean;
  embeddedChunks: number;
  message: string;
}

// ── Batch Operations ────────────────────────────────────────────

export interface BatchDeleteRequest {
  ids: string[];
}

export interface BatchDeleteResponse {
  success: boolean;
  deleted: number;
  failed: number;
  errors: string[];
}

export interface BatchUpdateRequest {
  ids: string[];
  tags?: string[];
  category?: string;
  mode: "set" | "add" | "remove";
}

export interface BatchUpdateResponse {
  success: boolean;
  updated: number;
  failed: number;
  errors: string[];
}

// ── Knowledge Graph Linking ─────────────────────────────────────

export interface RelatedEntity {
  id: string;
  name: string;
  type: string;
  source: string;
  confidence: number;
}
