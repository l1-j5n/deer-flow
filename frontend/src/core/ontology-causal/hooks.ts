// =============================================================================
// v1.239 - Graph Causal Ontology Learning Engine - React Hooks
// =============================================================================

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  buildOntology,
  extractConcepts,
  alignOntology,
  reasonOntology,
  evolveOntology,
  validateSemantic,
  getOntologyCausalOverview,
  type OntologyBuildRequest,
  type ConceptExtractRequest,
  type OntologyAlignRequest,
  type OntologyReasonRequest,
  type OntologyEvolveRequest,
  type SemanticValidateRequest,
} from './api';

// Hook for building ontology
export function useOntologyBuild() {
  return useMutation({
    mutationFn: (request: OntologyBuildRequest) => buildOntology(request),
  });
}

// Hook for extracting concepts
export function useConceptExtract() {
  return useMutation({
    mutationFn: (request: ConceptExtractRequest) => extractConcepts(request),
  });
}

// Hook for aligning ontologies
export function useOntologyAlign() {
  return useMutation({
    mutationFn: (request: OntologyAlignRequest) => alignOntology(request),
  });
}

// Hook for ontology reasoning
export function useOntologyReason() {
  return useMutation({
    mutationFn: (request: OntologyReasonRequest) => reasonOntology(request),
  });
}

// Hook for ontology evolution
export function useOntologyEvolve() {
  return useMutation({
    mutationFn: (request: OntologyEvolveRequest) => evolveOntology(request),
  });
}

// Hook for semantic validation
export function useSemanticValidation() {
  return useMutation({
    mutationFn: (request: SemanticValidateRequest) => validateSemantic(request),
  });
}

// Hook for getting engine overview
export function useOntologyCausalOverview() {
  return useQuery({
    queryKey: ['ontology-causal', 'overview'],
    queryFn: getOntologyCausalOverview,
  });
}
