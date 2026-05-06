# ADR-060: PDF/DOCX Document Viewer UX Enhancement

**Date**: 2026-05-04
**Status**: Proposed
**Iteration**: v0.60.0

## Context

Knowledge Base currently supports PDF/DOCX file uploads with text extraction, but lacks:
- Page count information in document metadata
- Page navigation in the viewer
- Visual page indicators in chunk display

## Decision

Enhance PDF/DOCX UX by adding:
1. **Backend**: Page count extraction for PDF/DOCX files
2. **Frontend**: Page count display and chunk-to-page mapping

## Consequences

### Positive
- Users can see page count at a glance
- Chunks show estimated page numbers
- Better document navigation experience

### Neutral
- Additional computation on upload (minimal)

## Implementation

### Backend Changes
- Add `_get_page_count()` function in `knowledge_base.py`
- Add `pageCount` field to `DocumentMeta` Pydantic model
- Add `page` field to chunk data
- Update all API endpoints that return documents

### Frontend Changes
- Add `pageCount?: number` to `DocumentMeta` TypeScript interface
- Add `page?: number` to chunk type
- Update `DocumentViewerDialog` to display page info
- Show page count badge in metadata bar

## References

- [Knowledge Base Router](file:///D:/03_AITOOL/deer-flow/backend/app/gateway/routers/knowledge_base.py)
- [Document Viewer Dialog](file:///D:/03_AITOOL/deer-flow/frontend/src/app/workspace/knowledge-base/document-viewer-dialog.tsx)