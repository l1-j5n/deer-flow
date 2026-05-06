# ADR-059: KG Pipeline Enhancement with Entity Extraction

## Status
Accepted

## Date
2026-05-04

## Context
The Knowledge Graph was established in earlier iterations but lacked automated entity extraction from conversation data. Users manually added entities, making the KG underutilized.

## Decision
Implemented pattern-based entity extraction pipeline with three endpoints:

1. **POST /extract** - Preview extraction (analyze without creating)
2. **POST /extract-and-create** - Extract and persist entities
3. **POST /extract-session** - Extract from conversation history

## Implementation

### Backend (`knowledge_graph.py`)
- Added `ExtractEntitiesRequest/Response` Pydantic models
- Added pattern registry for entity types (person, organization, project, concept)
- Added confidence scoring based on text patterns and mention frequency

### Frontend (`knowledge-graph/`)
- Extended `api.ts` with extraction functions
- Added React Query hooks in `hooks.ts`

## Consequences

### Positive
- Enables session-to-KG pipeline automation
- Low-latency (no LLM needed for basic extraction)
- Reusable components for future LLM upgrade

### Negative
- Pattern-based extraction is limited vs LLM
- May produce false positives on complex text

## Alternatives Considered
- **LLM extraction**: Too expensive for real-time, deferred to v0.60
- **Manual only**: No automation, rejected

## Migration Path
v0.60 can upgrade pattern extraction → LLM extraction with same API surface.