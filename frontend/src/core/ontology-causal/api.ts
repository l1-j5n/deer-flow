// =============================================================================
// v1.239 - Graph Causal Ontology Learning Engine
// =============================================================================

/**
 * Causal Ontology Learning Engine API
 *
 * Provides ontology construction, concept extraction, ontology alignment,
 * ontology reasoning, ontology evolution, and semantic validation.
 *
 * Version: v1.239.0
 * Endpoints: 6 POST + 1 GET
 * Enums: 6 × 6 = 36 values
 */

// Enum Types
export enum OntologyConstruction {
  TOP_DOWN = "top_down",
  BOTTOM_UP = "bottom_up",
  HYBRID = "hybrid",
  DATA_DRIVEN = "data_driven",
  DOMAIN_EXPERT = "domain_expert",
  NEURAL_INDUCTIVE = "neural_inductive",
}

export enum ConceptExtraction {
  STATISTICAL = "statistical",
  LINGUISTIC = "linguistic",
  EMBEDDING = "embedding",
  GRAPH_BASED = "graph_based",
  PATTERN_MINING = "pattern_mining",
  MULTI_MODAL = "multi_modal",
}

export enum OntologyAlignment {
  LEXICAL = "lexical",
  STRUCTURAL = "structural",
  SEMANTIC = "semantic",
  INSTANCE_BASED = "instance_based",
  PROPAGATION = "propagation",
  LEARNED = "learned",
}

export enum OntologyReasoning {
  DEDUCTIVE = "deductive",
  INDUCTIVE = "inductive",
  ABDUCTIVE = "abductive",
  ANALOGICAL = "analogical",
  PROBABILISTIC = "probabilistic",
  FUZZY = "fuzzy",
}

export enum OntologyEvolution {
  EXPANSION = "expansion",
  REFINEMENT = "refinement",
  MERGE = "merge",
  SPLIT = "split",
  REVISION = "revision",
  RESTRUCTURE = "restructure",
}

export enum SemanticValidation {
  CONSISTENCY_CHECK = "consistency_check",
  COMPLETENESS_CHECK = "completeness_check",
  COHERENCE_CHECK = "coherence_check",
  DOMAIN_VALIDATION = "domain_validation",
  USER_VALIDATION = "user_validation",
  AUTOMATED_TEST = "automated_test",
}

// Request Types
export interface OntologyBuildRequest {
  graph_id: string;
  method: OntologyConstruction;
  max_depth: number;
  min_concept_support: number;
  domain_hints: string[];
}

export interface ConceptExtractRequest {
  graph_id: string;
  extractor: ConceptExtraction;
  n_concepts: number;
  min_confidence: number;
  source_types: string[];
}

export interface OntologyAlignRequest {
  graph_id: string;
  strategy: OntologyAlignment;
  target_ontology_id: string;
  threshold: number;
  max_mappings: number;
}

export interface OntologyReasonRequest {
  graph_id: string;
  reasoner: OntologyReasoning;
  query: string;
  max_inference_depth: number;
  confidence_threshold: number;
}

export interface OntologyEvolveRequest {
  graph_id: string;
  evolution_type: OntologyEvolution;
  new_facts: string[];
  validation_required: boolean;
  max_changes: number;
}

export interface SemanticValidateRequest {
  graph_id: string;
  validator: SemanticValidation;
  scope: string;
  severity_threshold: number;
  auto_fix: boolean;
}

// Response Types
export interface OntologyBuildResponse {
  graph_id: string;
  result: {
    method: string;
    method_info: Record<string, unknown>;
    n_concepts: number;
    n_relations: number;
    concepts_sample: Array<{
      id: string;
      label: string;
      level: number;
      support: number;
      confidence: number;
      properties: number;
      instances: number;
    }>;
    hierarchy: {
      max_depth: number;
      avg_breadth: number;
      root_concepts: number;
      leaf_concepts: number;
      is_a_relations: number;
      part_of_relations: number;
      custom_relations: number;
    };
    domain_hints_used: string[];
    construction_quality: {
      coherence: number;
      coverage: number;
      specificity: number;
      consistency: number;
      richness: number;
    };
    build_time_ms: number;
  };
  timestamp: number;
}

export interface ConceptExtractResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface OntologyAlignResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface OntologyReasonResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface OntologyEvolveResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface SemanticValidateResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface OntologyCausalOverview {
  engine: string;
  version: string;
  endpoints: string[];
  enums: {
    OntologyConstruction: string[];
    ConceptExtraction: string[];
    OntologyAlignment: string[];
    OntologyReasoning: string[];
    OntologyEvolution: string[];
    SemanticValidation: string[];
  };
  features: {
    construction_methods: number;
    extraction_methods: number;
    alignment_strategies: number;
    reasoning_strategies: number;
    evolution_types: number;
    validation_methods: number;
  };
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// API Functions
export async function buildOntology(
  request: OntologyBuildRequest
): Promise<OntologyBuildResponse> {
  const response = await fetch('/api/graph/ontology-causal/build', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to build ontology');
  return response.json();
}

export async function extractConcepts(
  request: ConceptExtractRequest
): Promise<ConceptExtractResponse> {
  const response = await fetch('/api/graph/ontology-causal/extract-concepts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to extract concepts');
  return response.json();
}

export async function alignOntology(
  request: OntologyAlignRequest
): Promise<OntologyAlignResponse> {
  const response = await fetch('/api/graph/ontology-causal/align', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to align ontology');
  return response.json();
}

export async function reasonOntology(
  request: OntologyReasonRequest
): Promise<OntologyReasonResponse> {
  const response = await fetch('/api/graph/ontology-causal/reason', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to reason ontology');
  return response.json();
}

export async function evolveOntology(
  request: OntologyEvolveRequest
): Promise<OntologyEvolveResponse> {
  const response = await fetch('/api/graph/ontology-causal/evolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to evolve ontology');
  return response.json();
}

export async function validateSemantic(
  request: SemanticValidateRequest
): Promise<SemanticValidateResponse> {
  const response = await fetch('/api/graph/ontology-causal/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to validate semantic');
  return response.json();
}

export async function getOntologyCausalOverview(): Promise<OntologyCausalOverview> {
  const response = await fetch('/api/graph/ontology-causal/overview');
  if (!response.ok) throw new Error('Failed to get overview');
  return response.json();
}

// Export all types and functions
export default {
  // Enums
  OntologyConstruction,
  ConceptExtraction,
  OntologyAlignment,
  OntologyReasoning,
  OntologyEvolution,
  SemanticValidation,

  // API functions
  buildOntology,
  extractConcepts,
  alignOntology,
  reasonOntology,
  evolveOntology,
  validateSemantic,
  getOntologyCausalOverview,
};
