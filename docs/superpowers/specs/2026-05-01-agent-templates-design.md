# Agent Templates Design Spec

## Overview

Pre-configured agent templates that allow users to create specialized agents instantly without going through the conversational bootstrap flow. Templates are accessible from the Agents Gallery and provide a one-click creation experience.

## Problem

Currently, creating an agent requires:
1. Going to "New Agent"
2. Naming the agent
3. Having a conversation to bootstrap the SOUL

This is great for custom agents but slow for common use cases. Users often want standard agent types (Code Reviewer, Research Assistant, etc.) without the setup friction.

## Solution

A template system with:
- **Built-in templates**: Pre-defined agent configurations shipped with the platform
- **Template gallery**: Browse and select from available templates
- **One-click creation**: Create an agent from a template with a single action
- **Template details**: View description, capabilities, and configuration before creating

## User Flow

1. User clicks "New Agent" in Agents Gallery
2. Presented with choice: "From Template" or "Custom Agent"
3. "From Template" shows a grid of available templates
4. Clicking a template shows a preview dialog with details
5. "Create Agent" button creates the agent instantly with pre-filled config

## Templates (v0.6.0)

### Built-in Templates

| Template | Description | Model | Tool Groups | SOUL Preview |
|----------|-------------|-------|-------------|--------------|
| Code Reviewer | Reviews code for style, logic, security | - | code-tools | Focus on code quality... |
| Research Assistant | Deep research with source tracking | - | search, web | Be thorough and cite sources... |
| Data Analyst | Analyzes datasets and creates visualizations | - | data, charts | Focus on data insights... |
| Writing Partner | Helps draft and edit content | - | - | Be a collaborative editor... |
| DevOps Helper | Assists with deployment and infrastructure | - | shell, system | Focus on safe operations... |
| Meeting Summarizer | Extracts action items from transcripts | - | - | Identify decisions and actions... |

## Data Model

```typescript
interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: "development" | "research" | "creative" | "productivity" | "system";
  config: {
    model?: string;
    tool_groups?: string[];
    soul: string;
  };
  isBuiltin: boolean;
}
```

## UI Design

### Template Selection Page

- Route: `/workspace/agents/new/template`
- Grid layout: 2-3 columns responsive
- Each card shows: icon, name, description, category badge
- Click to expand preview dialog
- "Use Template" button in dialog
- "Back" link to custom creation

### Template Card

```
┌─────────────────────────────┐
│  [Icon]  Category Badge     │
│  Template Name              │
│  Brief description...       │
│                             │
│  [View Details] [Use]       │
└─────────────────────────────┘
```

### Template Preview Dialog

```
┌─────────────────────────────────────┐
│  [Icon]  Template Name          [X] │
├─────────────────────────────────────┤
│  Category: Development              │
│                                     │
│  Full description...                │
│                                     │
│  Configuration:                     │
│  • Model: default                   │
│  • Tools: code-tools                │
│                                     │
│  SOUL Preview:                      │
│  ┌─────────────────────────────┐    │
│  │ You are a code reviewer...  │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancel]        [Create Agent]     │
└─────────────────────────────────────┘
```

## Backend Changes

None required for v0.6.0. Templates are stored as static JSON/TypeScript in the frontend. The existing `POST /api/agents` endpoint handles creation.

Future iterations may add:
- `GET /api/agent-templates` for server-side templates
- User-created templates
- Template marketplace integration

## Frontend Changes

### New Files

1. `frontend/src/core/agents/templates.ts` — Template definitions and data
2. `frontend/src/app/workspace/agents/new/template/page.tsx` — Template selection page
3. `frontend/src/components/workspace/agents/template-card.tsx` — Template card component
4. `frontend/src/components/workspace/agents/template-preview-dialog.tsx` — Preview dialog

### Modified Files

1. `frontend/src/app/workspace/agents/new/page.tsx` — Add template selection step
2. `frontend/src/core/i18n/locales/en-US.ts` — Add template translation keys
3. `frontend/src/core/i18n/locales/zh-CN.ts` — Add template translation keys
4. `frontend/src/core/i18n/locales/types.ts` — Add template type definitions

## Implementation Plan

See: `docs/superpowers/plans/2026-05-01-agent-templates.md`

## Future Enhancements

- User-created templates (save existing agent as template)
- Template marketplace (share/download community templates)
- Template categories with filtering
- Template search
- Template ratings/reviews
- Import/export templates as JSON
