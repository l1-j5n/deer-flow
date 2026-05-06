# DeerFlow Agent Platform - Iteration Progress

## Project Overview
- **Name**: DeerFlow Agent Platform
- **Frontend**: Electron + Next.js + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + LangGraph
- **Workspace**: `/d/03_AITOOL/deer-flow/frontend/src/app/workspace`

---

## Iteration History

### v0.1.0 - Initial Marketplace Module (2026-05-01)
**Module**: `marketplace`
**File**: `frontend/src/app/workspace/marketplace/page.tsx` (~688 lines)

**Features**:
- Complete plugin/skill/template/agent marketplace
- Install, uninstall, update operations
- Search, filter by type/category, sort (popular/rated/recent/name)
- Statistics dashboard (total items, installed count, per-type counts)
- Item detail dialog with dependencies, permissions, compatibility
- Real-time install status tracking
- Integration with Electron API (`window.electronAPI.marketplace`)

**Types**: `MarketplaceItem` with full metadata (version, author, rating, downloads, dependencies, permissions, hooks, compatibility)

---

### v0.2.0 - Agent Detail & Analytics Page (2026-05-01)
**Module**: `agents` (detail view)
**Files**:
- `frontend/src/app/workspace/agents/[agent_name]/page.tsx` (~602 lines) **NEW**
- `frontend/src/components/workspace/agents/agent-card.tsx` **MODIFIED** (added detail navigation)

**Features**:
- Agent detail page with dynamic route `/workspace/agents/:agent_name`
- **Overview Tab**: View and edit agent properties
  - Description (textarea)
  - Model (input)
  - Tool Groups (comma-separated input, displayed as badges)
  - Soul / Personality (textarea)
  - Inline edit mode with Save/Cancel
- **Analytics Tab**: Usage statistics
  - Stat cards: Total Chats, Messages, Tool Calls, Avg Response Time
  - Weekly Activity chart (progress bars per day)
  - Top Tools usage ranking
- Agent header with model badge, last active time
- Quick actions: New Chat, Edit, Delete
- Delete confirmation dialog
- Loading skeleton states
- Not found state for missing agents
- Integration with existing `useAgent`, `useUpdateAgent`, `useDeleteAgent` hooks

**AgentCard Enhancement**:
- Added "View Details" (EyeIcon) button linking to detail page
- Preserved existing Chat and Delete actions

---

### v0.3.0 - Agent Chat History & Real-time Status (2026-05-01)
**Module**: `agents` (detail view enhancement)
**Files**:
- `frontend/src/app/workspace/agents/[agent_name]/page.tsx` (~807 lines) **MODIFIED**
- `frontend/src/core/threads/hooks.ts` **MODIFIED** (added `useAgentThreads` hook)
- `frontend/src/core/threads/index.ts` **MODIFIED** (added exports)

**Features**:
- **Chat History Tab**: New third tab on agent detail page
  - Lists all conversations (threads) associated with this agent
  - Real-time thread count badge on tab trigger
  - Search/filter conversations by title
  - Click to resume any past conversation
  - Empty state with "Start Chat" CTA
  - Skeleton loading state
  - Scrollable list with `ScrollArea`
- **Real-time Agent Status Indicator**: Status badge in page header
  - 4 states: `online` (green + pulse), `offline` (gray), `busy` (amber), `unknown`
  - Animated ping dot for online status
  - Styled badge with color-coded borders
  - Mock hook `useAgentStatus` (ready for WebSocket/backend integration)
- **Delete Dialog Fix**: Replaced custom modal overlay with proper shadcn `Dialog` component
  - Uses `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - Proper focus management and accessibility
  - Consistent with rest of app patterns

**New Hook — `useAgentThreads(agentName)`**:
- Searches all threads (limit 200, sorted by `updated_at` desc)
- Filters by `metadata.agent_name` or `values.agent_name`
- Returns `{ threads, isLoading, error }`
- Reuses existing `useThreads` with client-side filtering

**Technical Debt Resolved**:
- Delete dialog now uses shadcn Dialog (was custom modal)

**New Technical Debt**:
- `useAgentStatus` is mocked (needs WebSocket or backend status endpoint)
- `useAgentStats` still mocked (unchanged from v0.2.0)

---

### v0.4.0 - Agent Analytics API Integration (2026-05-01)
**Module**: `agents` (analytics backend + frontend hooks)
**Files**:
- `backend/app/gateway/routers/agents.py` **MODIFIED** (~+180 lines)
  - Added `AgentStatsResponse` Pydantic model
  - Added `GET /api/agents/{name}/stats` endpoint
  - Added `_list_agent_threads()` helper with async/sync checkpointer support
  - Added `_thread_to_dict()` normalizer
  - Real-time stats computed from checkpointer thread data
- `frontend/src/core/agents/api.ts` **MODIFIED**
  - Added `AgentStats` interface
  - Added `getAgentStats(name)` API function
- `frontend/src/core/agents/types.ts` **MODIFIED**
  - Added `AgentStats` type definition
- `frontend/src/core/agents/hooks.ts` **MODIFIED**
  - Added `useAgentStats(name)` React Query hook
- `frontend/src/app/workspace/agents/[agent_name]/page.tsx` **MODIFIED**
  - Replaced mock `useAgentStats` with real hook from `@/core/agents`
  - Updated property names from camelCase (`totalChats`) to snake_case (`total_chats`) to match backend
  - Removed ~40 lines of mock data code

**Features**:
- **Real Agent Statistics**: Backend computes actual metrics from LangGraph checkpointer
  - `total_chats`: Count of threads belonging to this agent
  - `total_messages`: Sum of messages across all agent threads
  - `tool_calls`: Count of tool invocations extracted from message history
  - `last_active`: Most recent `updated_at` across agent threads
  - `weekly_activity`: Daily message counts for the past 7 days
  - `top_tools`: Most frequently used tools (top 5)
- **Checkpointer Agnostic**: Supports InMemorySaver, SqliteSaver, PostgresSaver (sync + async)
- **Graceful Degradation**: Returns empty stats if checkpointer unavailable or no threads found
- **Frontend Integration**: Seamless replacement — same UI, real data

**Technical Debt Resolved**:
- `useAgentStats` is no longer mocked — now calls real backend endpoint

**New Technical Debt**:
- `avg_response_time` is still a heuristic estimate (2.5s placeholder) — needs timing middleware
- `useAgentStatus` remains mocked

---

### v0.5.0 - Agent Comparison Tool (2026-05-01)
**Module**: `agents` (comparison feature)
**Files**:
- `backend/app/gateway/routers/agents.py` **MODIFIED**
  - Added `AgentCompareRequest`, `AgentCompareItem`, `AgentCompareResponse` Pydantic models
  - Added `POST /api/agents/compare` endpoint for batch stats retrieval
  - Parallel stats computation for multiple agents with graceful skip for missing agents
- `frontend/src/core/agents/api.ts` **MODIFIED**
  - Added `AgentCompareItem`, `AgentCompareResponse` interfaces
  - Added `compareAgentStats(names)` API function
- `frontend/src/core/agents/types.ts` **MODIFIED**
  - Added `AgentCompareItem`, `AgentCompareResponse` type exports
- `frontend/src/core/agents/hooks.ts` **MODIFIED**
  - Added `useAgentComparison(names)` React Query hook
- `frontend/src/core/agents/index.ts` **MODIFIED**
  - Fixed duplicate export ambiguity between `api.ts` and `types.ts`
- `frontend/src/components/workspace/agents/agent-card.tsx` **MODIFIED**
  - Added `selectable`, `selected`, `onSelectToggle` props
  - Checkbox UI for comparison selection mode
  - Click propagation handling for selection vs actions
- `frontend/src/components/workspace/agents/agent-gallery.tsx` **MODIFIED**
  - Added compare mode toggle with "Compare" / "Cancel" buttons
  - Multi-select state management (max 4 agents)
  - Selection counter display
  - Navigate to comparison page with selected agents
- `frontend/src/app/workspace/agents/compare/page.tsx` **NEW** (~430 lines)
  - Full comparison page at `/workspace/agents/compare?agents=name1,name2`
  - Color-coded agent legend
  - 4 key metric comparison bars (Total Chats, Messages, Tool Calls, Avg Response Time)
  - Weekly activity trend chart with multi-agent daily bars
  - Tool usage comparison with aggregated cross-agent tool stats
  - Summary table with all metrics per agent
  - Loading skeleton state
  - Empty state for insufficient selections

**Features**:
- **Multi-Agent Selection**: Select 2-4 agents from gallery via checkbox mode
- **Side-by-Side Metrics**: Visual bar charts comparing key performance indicators
- **Weekly Trend Comparison**: Daily message counts across all selected agents
- **Tool Usage Cross-Analysis**: Aggregated tool usage showing which tools each agent uses most
- **Summary Table**: Clean tabular overview of all stats
- **Color Coding**: Each agent assigned a unique color (emerald/blue/amber/rose) for visual distinction

**Technical Debt Resolved**:
- Fixed duplicate `useAgentStatus` mock function in agent detail page
- Fixed `AgentStats` type reference issues (camelCase → snake_case)
- Fixed `loading` → `isLoading` property name mismatch in hooks

**New Technical Debt**:
- `avg_response_time` is still a heuristic estimate (2.5s placeholder)
- `useAgentStatus` remains mocked
- Compare page uses hardcoded English strings (needs i18n keys)

---

### v0.6.0 - Agent Templates (2026-05-01)
**Module**: `agents` (template system)
**Files**:
- `frontend/src/core/agents/templates.ts` **NEW** (~180 lines)
  - `AgentTemplate` interface with id, name, description, icon, category, config
  - `TemplateCategory` union type: development | research | creative | productivity | system
  - `builtInTemplates` array with 6 pre-configured templates:
    - Code Reviewer, Research Assistant, Data Analyst, Writing Partner, DevOps Helper, Meeting Summarizer
  - Each template has pre-defined SOUL, model, and tool_groups
  - Helper functions: `getTemplateById()`, `getTemplatesByCategory()`
  - Category metadata with color coding
- `frontend/src/components/workspace/agents/template-card.tsx` **NEW** (~70 lines)
  - Card component displaying template icon, name, description, category badge
  - Preview button to open detail dialog
- `frontend/src/components/workspace/agents/template-preview-dialog.tsx` **NEW** (~120 lines)
  - shadcn Dialog with template details
  - Shows category, configuration (model, tools), SOUL preview
  - "Create Agent" button to instantiate from template
- `frontend/src/app/workspace/agents/new/template/page.tsx` **NEW** (~130 lines)
  - Template selection page at `/workspace/agents/new/template`
  - Grid layout with all built-in templates
  - Loading skeleton and empty states
  - Integrates with `createAgent` API
- `frontend/src/app/workspace/agents/new/page.tsx` **MODIFIED**
  - New `Step = "choose" | "name" | "chat"`
  - "Choose" step shows two options: Custom Agent vs From Template
  - Custom Agent continues to existing name/chat flow
  - From Template navigates to `/workspace/agents/new/template`
- `frontend/src/core/i18n/locales/types.ts` **MODIFIED**
  - Added `agents.templates` namespace with 16 translation keys
- `frontend/src/core/i18n/locales/en-US.ts` **MODIFIED**
  - Added English template translations
- `frontend/src/core/i18n/locales/zh-CN.ts` **MODIFIED**
  - Added Chinese template translations
- `frontend/src/core/i18n/locales/de-DE.ts` **MODIFIED**
  - Added German template translations
- `frontend/src/core/i18n/locales/fr-FR.ts` **MODIFIED**
  - Added French template translations
- `frontend/src/core/i18n/locales/ja-JP.ts` **MODIFIED**
  - Added Japanese template translations
- `frontend/src/core/i18n/locales/ko-KR.ts` **MODIFIED**
  - Added Korean template translations

**Features**:
- **6 Built-in Templates**: Pre-configured agents for common use cases
- **Template Categories**: Color-coded by type (Development=blue, Research=purple, Creative=pink, Productivity=emerald, System=slate)
- **One-Click Creation**: Create an agent from a template with pre-filled SOUL, model, and tools
- **Template Preview**: Dialog showing full configuration before creation
- **Creation Flow Choice**: Users choose between custom creation (conversation) or template (instant)
- **Full i18n Support**: All template UI text translated in 6 languages
- **Unique Naming**: Template-created agents use `template-id-timestamp` naming to avoid conflicts

**Technical Debt Resolved**:
- Compare page i18n keys noted in v0.5.0 — not yet addressed (deferred to future iteration)

**New Technical Debt**:
- Template names use timestamp suffix (not user-friendly) — could allow custom naming
- No template persistence (frontend-only) — future: backend template API
- No user-created templates — future: "Save as Template" feature

---

### v0.7.0 - Agent Status WebSocket + Response Time Tracking (2026-05-01)
**Module**: `agents` (real-time status + i18n)
**Files**:
- `frontend/src/core/agents/hooks.ts` **MODIFIED** (~+120 lines)
  - Added `AgentStatus` type: `"online" | "offline" | "busy" | "unknown"`
  - Added `AgentStatusData` interface with `status`, `responseTimeMs`, `lastSeen`, `version`
  - Added `useAgentStatus(agentName)` hook with dual-mode connectivity:
    - **WebSocket primary**: Connects to `/ws/agents/{name}/status` with auto-reconnect (5s)
    - **HTTP fallback**: Initial status fetch via `GET /api/agents/{name}/status`
    - **Ping/pong RTT**: 30s heartbeat with round-trip time measurement
    - **Cleanup**: Proper `useEffect` teardown (close WS, clear timers)
- `backend/app/gateway/routers/agents.py` **MODIFIED** (~+40 lines)
  - Added `AgentStatusResponse` Pydantic model
  - Added `GET /api/agents/{name}/status` endpoint
  - Status logic: `<60s` since last thread activity = `busy`, `<300s` = `online`, else `offline`
  - Response time heuristic based on thread count (fewer threads = faster response)
- `frontend/src/app/workspace/agents/[agent_name]/page.tsx` **MODIFIED**
  - Integrated `useAgentStatus` hook replacing mock status
  - `StatusBadge` now displays response time (e.g., "online · 45ms") when available
  - Real-time status updates without page refresh
- `frontend/src/app/workspace/agents/compare/page.tsx` **MODIFIED** (~430 lines refactored)
  - Complete i18n refactor: all hardcoded English strings replaced with `t("agents.compare.*")` keys
  - Added `_formatTimeAgo()` helper with parameterized translations (justNow, minutesAgo, hoursAgo, daysAgo, never)
  - Updated for new `t()` function signature `(key: string, params?: Record<string, string>) => string`
- `frontend/src/core/i18n/locales/types.ts` **MODIFIED**
  - Added `agents.compare` namespace with 24 translation keys
- `frontend/src/core/i18n/locales/en-US.ts`, `zh-CN.ts`, `de-DE.ts`, `fr-FR.ts`, `ja-JP.ts`, `ko-KR.ts` **ALL MODIFIED**
  - Full `agents.compare` translations in all 6 languages
- `frontend/src/core/i18n/hooks.ts` **MODIFIED**
  - Changed `t` from `Translations` object to function supporting dot-notation keys
  - Added parameter interpolation: `t("agents.compare.minutesAgo", { mins: "5" })`
- `frontend/src/core/tools/utils.ts` **MODIFIED**
  - Updated `explainLastToolCall` and `explainToolCall` to accept new `t` function signature
- `frontend/src/core/agents/index.ts` **MODIFIED**
  - Fixed duplicate export conflicts between `api.ts` and `hooks.ts`
  - Clean separation: `export *` from api/hooks, explicit type exports
- `frontend/src/components/ui/accordion.tsx` **NEW** (~133 lines)
  - Custom accordion implementation without Radix dependency
  - Context-based state management with single/collapsible modes
  - Full TypeScript with forwardRef support
- `frontend/src/core/electron-api/state-sync-hooks.ts` **MODIFIED**
  - Fixed `StateUpdate` type mismatches with inline type annotations
  - Fixed generic `T` constraint issue (`{} | null` incompatible)
  - Fixed `useStateSyncMulti` return type to `Partial<T>`
- `frontend/src/app/workspace/plugin-sdk/page.tsx` **MODIFIED**
  - Fixed "Object is possibly 'undefined'" errors in CODE_TEMPLATES
  - Changed `this.name` to `this.pluginName`, removed `!` non-null assertions

**Features**:
- **Real-time Agent Status**: WebSocket-powered live status with 4 states (online/offline/busy/unknown)
- **Response Time Tracking**: Ping/pong RTT measurement displayed next to status badge
- **Auto-reconnect**: WebSocket reconnects every 5s on disconnect
- **Full Compare Page i18n**: 24 translation keys in 6 languages
- **Dot-notation i18n**: `t("agents.compare.title")` with parameter interpolation support
- **TypeScript Clean**: Zero non-i18n TypeScript compilation errors

**Technical Debt Resolved**:
- `useAgentStatus` is no longer mocked — real WebSocket + HTTP fallback
- Compare page hardcoded strings fully internationalized
- Critical TypeScript errors in state-sync-hooks.ts fixed
- Plugin-sdk page.tsx null assertion errors fixed

**New Technical Debt**:
- 337 i18n dot-notation errors remain (old `t.key` syntax vs new `t("key")` function)
  - Runtime works correctly; TypeScript expects gradual migration of all components
- `avg_response_time` in stats is still heuristic — needs request timing middleware
- WebSocket endpoint is assumed; needs backend WS route implementation

---

### v0.8.0 - Backend WebSocket + Response Time Middleware (2026-05-02)
**Module**: `agents` (backend infrastructure)
**Files**:
- `backend/app/gateway/timing.py` **NEW** (~80 lines)
  - `TimingStore` thread-safe per-agent timing buffer (async Lock + deque)
  - `_AgentTiming` sliding window (max 50 samples) with `avg_ms` / `last_response_time_ms`
  - Module-level singleton via `get_timing_store()` for cross-router access
- `backend/app/gateway/routers/ws.py` **NEW** (~130 lines)
  - WebSocket endpoint `@router.websocket("/ws/agents/{name}/status")`
  - Periodic status push every 5s: `{type:"status", status, responseTimeMs, lastSeen, version}`
  - Ping/pong RTT measurement: echoes back `{type:"pong", ts}`
  - Graceful disconnect handling with `WebSocketDisconnect`
  - Reuses existing `_list_agent_threads` / checkpointer for activity computation
- `backend/app/gateway/app.py` **MODIFIED** (~+25 lines)
  - Added `@app.middleware("http")` timing middleware that records response time per agent
  - Middleware extracts agent name from `/api/agents/{name}/*` path patterns
  - Registered `ws.router` for WebSocket support
  - Imported `timing` and `ws` modules
- `backend/app/gateway/routers/__init__.py` **MODIFIED**
  - Added `ws` to package exports
- `backend/app/gateway/routers/agents.py` **MODIFIED** (~+12 lines)
  - `get_agent_stats`: replaced `avg_response_time = 2.5` placeholder with real `timing_store.avg_response_time_ms()` data
  - `get_agent_status`: replaced `response_time_ms` heuristic with real `timing_store.last_response_time_ms()` data
  - Both keep heuristic fallback when no timing data available yet
- `docker/nginx/nginx.conf` **MODIFIED** (~+15 lines)
  - Added `/ws/` location block proxying to Gateway with WebSocket Upgrade headers
- `docker/nginx/nginx.local.conf` **MODIFIED** (~+15 lines)
  - Same `/ws/` location block for local development

**Features**:
- **Real Response Time Tracking**: Gateway HTTP middleware records actual API response times per agent, replacing hardcoded `2.5s` / `500+N*50ms` heuristics
- **Production WebSocket Endpoint**: Backend now serves real `/ws/agents/{name}/status` — no longer "assumed"
- **Sliding-Window Averaging**: 50-sample deque per agent for stable `avg_response_time` in stats
- **Zero Frontend Changes**: `useAgentStatus` hook already handles `{type:"pong", ts}` and `{type:"status", ...}` messages via WebSocket + HTTP fallback
- **Nginx WebSocket Proxy**: Both Docker and local nginx configs now route `/ws/*` to Gateway with proper upgrade headers

**Technical Debt Resolved**:
- `avg_response_time` in stats is now real (measured by Gateway middleware) — no longer `2.5s` placeholder
- WebSocket endpoint is now implemented on backend — no longer "assumed"
- Response time heuristic in status endpoint replaced with real timing data

**New Technical Debt**:
- Timing data only reflects Gateway API response time, not actual LangGraph agent processing time (agent-level instrumentation requires LangGraph middleware/pipeline hooks)
- Timing store is in-memory only — lost on Gateway restart; could persist to checkpointer in future
- 337 i18n dot-notation errors still remain

---

### v0.9.0 — Timing Persistence & Observability (2026-05-02)
**Module**: `agents` (backend infrastructure quality)

**Files**:
- `backend/app/gateway/timing.py` **ENHANCED** (~+100 lines)
  - `_AgentTiming` now has two-tier data: short sliding window (50 samples for avg) + long history (200 samples for percentiles)
  - `percentile_ms(pct)` — linear interpolated percentile from sample_history (p50, p95, p99)
  - `history_as_list()` / `to_snapshot()` / `from_snapshot()` — serialization for persistence
  - `TimingStore.save_snapshot(agent_name, agent_dir)` — writes `timing.json` to agent directory
  - `TimingStore.load_snapshot(agent_name, agent_dir)` — restores from disk on startup
  - `TimingStore.save_all_to_dir(base_dir)` — bulk persist for shutdown
  - `TimingStore.prune_old_snapshots(base_dir)` — cleanup for deleted agents
  - `TimingStore.get_history(agent_name)` — timestamped sample list for API
  - `TimingStore.percentile_ms(agent_name, pct)` — on-demand percentile queries
  - `TimingStore.get_agent_names()` — list all agents with timing data
- `backend/app/gateway/routers/agents.py` **MODIFIED** (~+20 lines)
  - Extended `AgentStatsResponse` with `p50_response_time`, `p95_response_time`, `p99_response_time` (float seconds)
  - `get_agent_stats` now computes latency percentiles from TimingStore
  - Added `TimingHistoryResponse` Pydantic model
  - Added `GET /api/agents/{name}/timing` endpoint returning `{agent_name, samples: [{ts, value_ms}], count, avg_ms, min_ms, max_ms}`
- `backend/app/gateway/app.py` **MODIFIED** (~+40 lines)
  - Renamed `timing_middleware` → `_timing_middleware` to avoid shadowing `timing` module
  - Added `_restore_timing_snapshots()` — scans agent directories for `timing.json`, loads into TimingStore at startup
  - Added `_persist_all_timing()` — saves all agent timing data on shutdown
  - Wired both into `lifespan()`: restore after config load, persist before shutdown
- `backend/app/gateway/routers/ws.py` **REFACTORED** (~-30/+20 lines)
  - Replaced `_compute_agent_status()` + `_get_last_seen()` (2 separate checkpointer queries) with single `_compute_agent_activity()` → `{status, last_seen}` dict
  - `agent_status_ws()` now calls `_list_agent_threads` once per push cycle (was 2x)
- `backend/app/gateway/routers/__init__.py` **FIXED** (+3 lines)
  - Added missing `agents`, `channels`, `memory` to imports and `__all__`

**Features**:
- **Timing Data Durability**: JSON snapshots in agent directories survive Gateway restarts; auto-loaded on startup, auto-saved on shutdown
- **Latency Percentiles**: p50/p95/p99 response time now available in agent stats (replaces single avg)
- **Timing History API**: `GET /api/agents/{name}/timing` returns timestamped response-time samples for frontend charts
- **Efficient WebSocket**: 50% reduction in checkpointer queries per push cycle (1x instead of 2x)
- **Complete Router Exports**: `__init__.py` now exports all 11 routers consistently

**Technical Debt Resolved**:
- Timing store persistence (v0.8.0: in-memory only → v0.9.0: file-based, survives restart)
- ws.py duplicate checkpointer queries (2x → 1x per WebSocket push cycle)
- Incomplete `__init__.py` router exports (3 missing routers added)
- `timing_middleware` function name shadowing `timing` import (renamed `_timing_middleware`)

**New Technical Debt**:
- Timing persistence is per-agent file — could migrate to checkpointer for multi-Gateway consistency
- No frontend visualization of timing history (deferred to v0.10.0)
- No alerting on slow response times (deferred)

---

| Module | File(s) | Lines | Status |
|--------|---------|-------|--------|
| Dashboard | `dashboard/page.tsx` | 479 | Complete |
| Agents Gallery | `agents/page.tsx` + `components/agent-gallery.tsx` | 5 + 69 | Complete |
| Agent Creation | `agents/new/page.tsx` | 252 | Complete |
| Agent Chat | `agents/[agent_name]/chats/[thread_id]/page.tsx` | 191 | Complete |
| **Agent Detail** | `agents/[agent_name]/page.tsx` | **807** | **Complete** |
| **Agent Comparison** | `agents/compare/page.tsx` | **~430** | **Complete** |
| **Agent Templates** | `agents/new/template/page.tsx` + `templates.ts` | **~130 + ~180** | **Complete** |
| Marketplace | `marketplace/page.tsx` | 688 | Complete |
| Settings | `settings/page.tsx` | 653 | Complete |
| Knowledge Graph | `knowledge-graph/page.tsx` | 728 | Complete |
| Chats | `chats/page.tsx` | 74 | Complete |
| Health | `health/page.tsx` | 487 | **Refactored v0.34.0** (REST API + mock fallback) |
| Scheduler | `scheduler/page.tsx` | 554 | Complete |
| Collaboration | `collaboration/page.tsx` | 591 | Complete |
| Memory | `memory/page.tsx` | 409 | Complete |
| Search | `search/page.tsx` | 442 | Complete |
| Security | `security/page.tsx` | 344 | Complete |
| Audit | `audit/page.tsx` | 426 | Complete |
| Backup | `backup/page.tsx` | 766 | Complete |
| Charts | `charts/page.tsx` | 522 | Complete |
| Performance | `performance/page.tsx` | 455 | **Refactored v0.33.0** (REST API + mock fallback) |
| Realtime Dashboard | `realtime-dashboard/page.tsx` | 498 | Complete |
| Reasoning | `reasoning/page.tsx` | 516 | Complete |
| Plugin Monitor | `plugin-monitor/page.tsx` | 566 | Complete |
| Plugin SDK | `plugin-sdk/page.tsx` | 730 | Complete |
| Tools | `tools/page.tsx` | 400 | Complete |
| Tool Tester | `tool-tester/page.tsx` | 627 | Complete |
| Templates | `templates/page.tsx` | 465 | Complete |
| Notifications | `notifications/page.tsx` | 469 | Complete |
| Session Export | `session-export/page.tsx` | 472 | Complete |
| Data Manager | `data-manager/page.tsx` | 426 | Complete |
| Command Palette | `command-palette/page.tsx` | 399 | Complete |
| Shortcuts | `shortcuts/page.tsx` | 379 | Complete |
| Onboarding | `onboarding/page.tsx` | 348 | Complete |
| Plugins | `plugins/page.tsx` | 345 | Complete |
| Theme | `theme/page.tsx` | 314 | Complete |
| Alerts | `alerts/page.tsx` | 520 | Complete |

**Total**: 35 workspace modules, ~16,500+ lines of page code

---

## Core Patterns Established

1. **Data Fetching**: React Query hooks in `core/*/hooks.ts`, API in `core/*/api.ts`
2. **Types**: Shared types in `core/*/types.ts`
3. **UI Components**: shadcn/ui (Card, Button, Badge, Input, Dialog, Tabs, Skeleton, Progress)
4. **Icons**: Lucide React icons throughout
5. **Styling**: Tailwind CSS with dark mode support
6. **I18n**: `useI18n()` hook for translations
7. **Electron Integration**: `window.electronAPI.*` for native features
8. **Toast Notifications**: `sonner` for user feedback

---

## Next Iteration Candidates

### High Priority
1. **Batch Agent Import/Export (ZIP)** ~~✅ v0.27.0~~
2. **Agent Version History** ~~✅ v0.28.0~~

### Medium Priority
3. **i18n Migration Wave 2** ~~✅ v0.27.0~~
4. **Timing History Frontend** — ~~✅ v0.9.0 (API), ✅ v0.30.0 (visualization)~~
5. **Agent-level Response Time** ~~✅ v0.37.0~~
6. **Marketplace API Integration** — Connect marketplace to real backend
7. **Plugin Management** — Install/unload plugins with live status

---

## v0.24.0 — Agent Platform Polish (2026-05-02) ✅

**Status**: Complete | **Build**: 0 TypeScript errors

### Changes
- **Gallery Search & Filter**: Search input (name/description), model filter chips, result count, empty states
- **Agent Import/Export**: Backend endpoints (GET export, POST import JSON/file upload w/ overwrite), frontend hooks (useExportAgent, useImportAgent), UI (import dialog w/ drag+drop, per-card export button)
- **Thread Cleanup**: Best-effort langgraph thread deletion on agent removal
- **Detail Page Full i18n**: All 50+ hardcoded strings replaced with `t.agents.detail.*` (StatusBadge, _formatTimeAgo, TopToolsList refactored to accept label props)
- **6-Language detail translations**: en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR with 55 detail keys + 10 gallery keys each

### Key Files
- `agents/[agent_name]/page.tsx` — Full i18n (~775 lines)
- `components/workspace/agents/agent-gallery.tsx` — Search/filter/import (~325 lines)
- `core/agents/api.ts` — exportAgent, importAgent, importAgentFromFile (+60 lines)
- `core/agents/hooks.ts` — useExportAgent, useImportAgent (+20 lines)
- `core/i18n/locales/{6 langs}.ts` — ~70 new keys per locale
- `backend/app/gateway/routers/agents.py` — Import/export endpoints + thread cleanup

### Next Candidates
1. Agent gallery advanced sorting (by name, chats, last active)
2. Agent comparison page i18n completion
3. Batch agent import/export (ZIP)
4. Agent version history (SOUL/config tracking)
5. Agent sharing links
13. **Multi-language** - Complete i18n coverage

---

## Technical Debt

- ~~i18n dot-notation~~ — **RESOLVED** v0.28.0 (all 3 waves complete, ~364 usages migrated, only intentional object/array accesses remain)
- ~~Timing data is Gateway HTTP response time only~~ — **RESOLVED** v0.37.0 (two-dimensional timing: Gateway HTTP + LangGraph processing, overhead computation, instrument endpoint)
- Timing persistence is file-based (per-agent JSON) — single Gateway process ok; multi-Gateway would need checkpointer-level persistence
- ~~Analytics charts are basic progress bars~~ — **RESOLVED** v0.30.0 (3 recharts visualizations: bar + horizontal bar + percentile)
- ~~Template naming~~ — **RESOLVED** v0.28.0 (custom name input replaces timestamp suffix)
- Event ring buffer persistence — **RESOLVED** v0.37.0 (disk persistence to realtime_events.json, 500 events on disk, auto-restore)
- Event detection is basic (3 count-delta types) — **ENHANCED** v0.37.0 (5 detection categories: count deltas, agent status transitions, alert firing/resolved, channel connections, health score thresholds)

---

## Design Documents

- **Agent Templates Design**: [`docs/superpowers/specs/2026-05-01-agent-templates-design.md`](docs/superpowers/specs/2026-05-01-agent-templates-design.md)
- **Agent Templates Plan**: [`docs/superpowers/plans/2026-05-01-agent-templates.md`](docs/superpowers/plans/2026-05-01-agent-templates.md)

---


---

### v0.10.0 — Agent Context i18n (2026-05-02)
**Module**: `agent-context` (i18n)

**Files**:
- `frontend/src/core/i18n/locales/types.ts` **MODIFIED** (~+43 lines)
  - Added `agentContext` section to `Translations` interface with 8 sub-sections and ~40 keys
- `frontend/src/core/i18n/locales/en-US.ts` **MODIFIED** (~+43 lines)
- `frontend/src/core/i18n/locales/zh-CN.ts` **MODIFIED** (~+43 lines)
- `frontend/src/core/i18n/locales/ja-JP.ts` **MODIFIED** (~+43 lines)
- `frontend/src/core/i18n/locales/ko-KR.ts` **MODIFIED** (~+43 lines)
- `frontend/src/core/i18n/locales/de-DE.ts` **MODIFIED** (~+43 lines)
- `frontend/src/core/i18n/locales/fr-FR.ts` **MODIFIED** (~+43 lines)
- `frontend/src/app/workspace/agent-context/page.tsx` **MODIFIED** (~50 replacements)
  - All 8 internal dialog components now use `const { t } = useI18n()`
  - ~50 hardcoded English strings replaced with `t("agentContext.*")` calls
  - Reused `common.cancel`, `common.save`, `common.create`, `common.delete` for shared button labels

**Features**:
- **Full i18n Coverage for Agent Context**: All 8 dialogs (Create, Rename, Delete, System Prompt, Compress, Inherit, Build Context, Session Detail) and main page now fully i18n-aware
- **6-Language Support**: English, Chinese (Simplified), German, French, Japanese, Korean
- **Parameterized Translations**: 9 keys use `{name}` or `{count}` placeholders (delete confirmation, message counts, token counts, error messages)
- **Type-Safe**: All translations satisfy the `Translations` interface; TypeScript compilation passes with zero new errors

**Technical Debt Resolved**:
- Agent Context page was the only workspace module with zero i18n usage — now fully covered
- Fixed variable shadowing bug: `t` i18n function vs `t` iterator variable in `InheritDialog`

**New Technical Debt**:
- Same 332 i18n dot-notation usages across 37 files still pending (legacy `t.key` → `t("key")` migration)
- No i18n test coverage for agent-context translations

---

### v0.25.0 — Slow Response Alerting System (2026-05-03) ✅

**Module**: `alerts` (new)
**Status**: Complete

**Features**:
- **Backend Alert Engine**: `backend/app/gateway/routers/alerts.py` (~280 lines) with p95 threshold monitoring, cooldown, auto-resolve
- **6 API Endpoints**: List/get/update alert configs, get alert history, evaluate alert rules (dry-run support)
- **File-based Persistence**: Alert state saved to `alerts_state.json`, loaded at startup, persisted at shutdown
- **Alerts Page**: `workspace/alerts/page.tsx` (~520 lines) with Configs and History tabs, per-agent config dialog (threshold/cooldown/severity), evaluate button
- **Frontend Module**: `core/alerts/` (types.ts, api.ts, hooks.ts, index.ts) — full React Query integration
- **Navigation**: Sidebar "Alerts" entry with `AlertTriangleIcon` after Notifications
- **Full i18n**: 42 keys per locale across 6 languages (en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR)

**Bug Fixes**:
- Fixed `TimingHistoryResponse` Pydantic model (was empty body, now has 6 fields)
- Added `common.saving` key to i18n types and all 6 locale files

**Key Files**:
- `backend/app/gateway/routers/alerts.py` — **NEW**
- `frontend/src/app/workspace/alerts/page.tsx` — **NEW** (~520 lines)
- `frontend/src/core/alerts/*` — **NEW** (4 files)
- `frontend/src/components/workspace/workspace-nav-chat-list.tsx` — Added alerts nav item
- `frontend/src/core/i18n/locales/*.ts` — All 6 locales + types updated
- `backend/app/gateway/routers/agents.py` — TimingHistoryResponse fix
- `backend/app/gateway/app.py` — Alerts router + lifecycle

**Next Candidates**:
1. i18n dot-notation migration: ~332 legacy `t.key` → `t("key")` usages
2. Agent gallery advanced sorting (by name, chats, last active)
3. Batch agent import/export (ZIP)
4. Agent version history (SOUL/config tracking)

---

### v0.26.0 — Agent Gallery Sorting + i18n Migration Wave 1 (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors

**Features**:
- **Agent Gallery Sort Dropdown**: Select component in search/filter bar with 4 sort options: Name (A-Z), Name (Z-A), Model (A-Z), Model (Z-A). Client-side `.sort()` with `localeCompare`, integrated into `filteredAgents` useMemo. `ArrowUpDownIcon` visual indicator.
- **Full i18n for Sort**: New `agents.sortBy` + `agents.sortOptions.{nameAsc,nameDesc,modelAsc,modelDesc}` keys in types.ts and all 6 locale files (en/zh/ja/ko/de/fr).
- **i18n Dot-Notation Migration Wave 1**: ~180+ old `t.key` usages migrated to `t("key")` function-style across 6 files:
  - `agents/[agent_name]/page.tsx` — all 53 `t.agents.detail.*` usages migrated, including `.replace()` → params conversion
  - `settings/memory-settings-page.tsx` — 40 usages (`t.settings.memory.*`, `t.common.*`)
  - `input-box.tsx` — 32 usages (`t.inputBox.*`, `t.common.*`; array accesses preserved)
  - `workspace-nav-chat-list.tsx` — 31 usages (`t.sidebar.*`, `t.common.*`)
  - `agents/new/page.tsx` — 19 usages (`t.agents.*`; `.replace("{name}")` → `{ name }` param)
  - `agents/agent-gallery.tsx` — 10 usages migrated alongside sort feature

**Key Technical Decisions**:
- Used `replace_all` + unique context for keys with prefix collision risk (e.g., `description` vs `descriptionPlaceholder`)
- Preserved non-translation array accesses (`t.inputBox.suggestions`, `t.inputBox.suggestionsCreate`) as dot-notation (they return arrays, not strings)
- Converted `.replace("{name}", v)` patterns to `t("key", { name: v })` parameter interpolation

**Key Files Modified**:
- `components/workspace/agents/agent-gallery.tsx` — Sort dropdown + dot-notation migration (~350 lines)
- `core/i18n/locales/types.ts` — New sort keys
- `core/i18n/locales/{en-US,zh-CN,ja-JP,ko-KR,de-DE,fr-FR}.ts` — Sort translations
- `app/workspace/agents/[agent_name]/page.tsx` — Migrated (now ~775 lines)
- `components/workspace/settings/memory-settings-page.tsx` — Migrated
- `components/workspace/input-box.tsx` — Migrated
- `components/workspace/workspace-nav-chat-list.tsx` — Migrated
- `app/workspace/agents/new/page.tsx` — Migrated

**Next Candidates** (resolved in v0.27.0):
1. ~~Batch agent import/export (ZIP)~~ ✅
2. Agent version history (SOUL/config tracking)
3. ~~i18n migration Wave 2~~ ✅ (~80 usages migrated)
4. Agent sharing links

---

### v0.27.0 — Batch Agent Import/Export (ZIP) + i18n Migration Wave 2 (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors

**Features**:

**A. Batch Agent Import/Export (ZIP)**:
- **Backend** — `backend/app/gateway/routers/agents.py` (~130 lines added):
  - `POST /api/agents/export-batch`: Accepts `{ names: [...] }` → returns ZIP stream with `manifest.json` + per-agent `{name}/agent.json` folders. Uses `zipfile.ZipFile` + `StreamingResponse`.
  - `POST /api/agents/import-batch`: Accepts ZIP file upload → extracts manifest, imports agents. Returns `BatchImportResponse` with `total/imported/skipped/failed` + per-agent results. Supports `overwrite` flag. Fallback ZIP scanning if manifest missing.
  - New models: `BatchExportRequest`, `BatchImportResult`, `BatchImportResponse`.
- **Frontend API** — `core/agents/api.ts` (~60 lines added):
  - `exportAgentsBatch(names)`: Returns Blob from batch export endpoint
  - `importAgentsBatch(file, overwrite?)`: Returns `BatchImportResponse`
  - `downloadBlob(blob, filename)`: Browser trigger for file download
  - Exported types: `BatchImportResult`, `BatchImportResponse`
- **Frontend Hooks** — `core/agents/hooks.ts`:
  - `useExportAgentsBatch()`: React Query mutation wrapping `exportAgentsBatch`
  - `useImportAgentsBatch()`: React Query mutation with cache invalidation
- **Agent Gallery UI** — `components/workspace/agents/agent-gallery.tsx` (~120 lines added):
  - **Batch Mode**: New `batchMode` state + `enterBatchMode`/`exitBatchMode`/`toggleSelectAll` handlers
  - **Header Buttons**: "Import ZIP" (FileArchiveIcon) + "Batch Select" (CheckSquareIcon) buttons in default mode
  - **Batch Mode Header**: Selection counter (`{count} of {total} selected`) + "Cancel" + "Export ZIP" (with loading spinner)
  - **Select-all Checkbox**: Custom inline checkbox (no external dependency) with checkmark SVG in filter bar
  - **Batch Import Dialog**: ZIP upload with drag-drop area, results summary (total/imported/skipped/failed badges), scrollable per-agent result list, close button
  - Agent cards show checkboxes in batch mode (reuses existing `selectable`/`selected` props)

**B. i18n Coverage — Batch Operations (6 languages)**:
- `core/i18n/locales/types.ts` — 24 new keys under `agents.*`: `batchSelect`, `batchSelectAll`, `batchCancel`, `batchExport`, `batchImport`, `batchImportTitle`, `batchImportDescription`, `batchImportDropHint`, `batchImportSelectFile`, `batchImportTotal`, `batchImportImported`, `batchImportSkipped`, `batchImportFailedLabel`, `batchSelectedCount`, `batchExportSuccess`, `batchExportFailed`, `batchImportSuccess`, `batchImportPartial`, `batchImportFailed`, `importDialogDescription`, `importDropHint`, `importSelectFile`, `importing`, `created`, `skipped`
- All 6 locale files (en/zh/ja/ko/de/fr) updated with translations

**C. i18n Dot-Notation Migration Wave 2** — ~80+ old `t.key` usages migrated to `t("key")` function-style across 12 files:
  - `messages/message-group.tsx` — 15 usages (`t.toolCalls.*`; parameterized `moreSteps(count)`, `searchOnWebFor(query)`, `useTool(name)` etc. with proper `{count}`/`{query}`/`{toolName}` param substitution)
  - `settings/settings-dialog.tsx` — 8 usages (`t.settings.sections.*`, `t.settings.title`)
  - `settings/appearance-settings-page.tsx` — 10 usages (`t.settings.appearance.*` for theme/language settings)
  - `workspace-nav-menu.tsx` — 7 usages (`t.workspace.*`, `t.common.settings`)
  - `agents/agent-card.tsx` — 7 usages (`t.agents.*`, `t.common.*`)
  - `workspace-container.tsx` — 4 usages (`t.workspace.githubTooltip`, `t.common.home`, `t.breadcrumb.*`)
  - `welcome.tsx` — 4 usages (`t.welcome.*`)
  - `export-trigger.tsx` — 5 usages (`t.common.export*`, `t.conversation.noMessages`)
  - `token-usage-indicator.tsx` — 4 usages (`t.tokenUsage.*`)
  - `workspace-header.tsx` — 1 usage (`t.sidebar.newChat`)
  - `copy-button.tsx` — 1 usage (`t.clipboard.copyToClipboard`)
  - `thread-title.tsx` — 3 usages (`t.pages.*`)
  - `mode-hover-guide.tsx` — 2 usages (`t.inputBox[getMode*Key]` → `t(\`inputBox.$\{key}\`)`)

**Key Technical Decisions**:
- ZIP format: `deerflow-agent-batch-v1` with `manifest.json` (export timestamp + agent list) + `{name}/agent.json` per agent
- Batch export uses in-memory `io.BytesIO` + `zipfile.ZIP_DEFLATED` → `StreamingResponse` (no temp files)
- Batch import gracefully handles missing manifest by scanning ZIP entries
- Replaced external `Checkbox` dependency with custom inline checkbox (same pattern as `AgentCard.selected` indicator)
- Preserved intentional dot-notation: `t.inputBox.suggestions` (array access), `t.agents.detail` (object access)

**Remaining Dot-Notation** (~80 usages across ~15 files):
- settings: notification (11), skill (9), tool (3)
- artifacts: file-detail (12), file-list (2), trigger (1)
- agents: template-preview-dialog (8), template-card (1)
- workspace: recent-chat-list (17), command-palette (2)
- pages: agents/chats pages (11), chats pages (5)

**Key Files Modified**:
- `backend/app/gateway/routers/agents.py` — Batch export/import endpoints (+130 lines)
- `core/agents/api.ts` — Batch API functions + `downloadBlob` (+60 lines)
- `core/agents/hooks.ts` — Batch hooks (+15 lines)
- `components/workspace/agents/agent-gallery.tsx` — Batch UI (select-all, buttons, dialogs) (+120 lines)
- `core/i18n/locales/types.ts` — 24 new batch keys
- `core/i18n/locales/{en-US,zh-CN,ja-JP,ko-KR,de-DE,fr-FR}.ts` — Batch translations
- `components/workspace/messages/message-group.tsx` — Migrated (15 usages)
- `components/workspace/settings/settings-dialog.tsx` — Migrated
- `components/workspace/settings/appearance-settings-page.tsx` — Migrated
- `components/workspace/workspace-nav-menu.tsx` — Migrated
- `components/workspace/agents/agent-card.tsx` — Migrated
- `components/workspace/workspace-container.tsx` — Migrated
- `components/workspace/welcome.tsx` — Migrated
- `components/workspace/export-trigger.tsx` — Migrated
- `components/workspace/token-usage-indicator.tsx` — Migrated
- `components/workspace/workspace-header.tsx` — Migrated
- `components/workspace/copy-button.tsx` — Migrated
- `components/workspace/thread-title.tsx` — Migrated
- `components/workspace/mode-hover-guide.tsx` — Migrated

### v0.28.0 — Agent Version History + i18n Wave 3 (Final) + Template Naming UX (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. i18n Dot-Notation Migration Wave 3 (Final)** — ~104 usages across 19 files:
- **Settings**: `notification-settings-page.tsx` (10), `skill-settings-page.tsx` (11), `tool-settings-page.tsx` (3)
- **Artifacts**: `artifact-file-detail.tsx` (15), `artifact-file-list.tsx` (2), `artifact-trigger.tsx` (1)
- **Agents**: `template-preview-dialog.tsx` (7), `template-card.tsx` (1), `new/template/page.tsx` (5)
- **Workspace**: `recent-chat-list.tsx` (19), `command-palette.tsx` (15)
- **Messages**: `subtask-card.tsx` (2), `message-list.tsx` (1 — fixed parameterized `{count}`), `message-list-item.tsx` (1)
- **App Pages**: `chats/page.tsx` (3), `chats/[thread_id]/page.tsx` (1), `agents/[agent_name]/chats/[thread_id]/page.tsx` (3)
- **Misc**: `use-chat-mode.ts` (2), `threads/hooks.ts` (2)

Intentional preserves (NOT migrated — returns objects/arrays, not strings):
- `t.agents.detail` — object sub-tree access (returns status labels object)
- `t.inputBox.suggestions` / `t.inputBox.suggestionsCreate` — array access (returns suggestion lists)

**Cumulative i18n Migration**: Wave 1 (~180) + Wave 2 (~80) + Wave 3 (~104) = **~364 total** dot-notation usages migrated across 3 waves. All remaining dot-notation usages are intentional object/array accesses.

**B. Agent Template Naming UX**:
- **Dialog Name Input**: `TemplatePreviewDialog` now includes a `Label` + `Input` for custom agent name, pre-filled with template name
- **Custom Name Flow**: `handleCreate` accepts `(template, customName)`, discards old timestamp suffix (`template.id-timestamp`)
- **Validation Guard**: Create button disabled when name input is empty
- **i18n Toasts**: Parameterized success (`t("agents.templates.createSuccess", { name })`) and error (`t("agents.templates.createFailed", { error })`) messages
- **6-Language Coverage**: New keys `agentName`, `createSuccess`, `createFailed` in all locales

**C. Agent Version History**:
- **Backend Snapshot Engine**: `_save_agent_version()` saves `{agent_dir}/versions/{version_id}/` with `config.yaml`, `SOUL.md`, and `metadata.json` on each update
- **Automatic Capture**: `update_agent()` detects changed fields (description, model, tool_groups, soul) and snapshots current state before overwriting
- **Version Listing API**: `GET /api/agents/{name}/versions` returns sorted `AgentVersionsResponse` with summaries
- **Version Detail API**: `GET /api/agents/{name}/versions/{version_id}` returns full `AgentVersionDetail` with config dict, soul text, and changed fields
- **New Backend Models**: `AgentVersionSummary`, `AgentVersionsResponse`, `AgentVersionDetail` Pydantic models
- **Frontend API + Hooks**: `getAgentVersions()`, `getAgentVersion()`, `useAgentVersions()`, `useAgentVersion()` in `core/agents/`
- **Frontend Types**: `AgentVersionSummary`, `AgentVersionsResponse`, `AgentVersionDetail` interfaces
- **Detail Page Tab**: New "Versions" tab (`GitBranchIcon`) with version count badge on agent detail page
- **Version History Card**: Lists versions with ISO timestamp ID, formatted time, and changed field badges (Description, Model, Tools, SOUL)
- **Empty State**: "No versions yet" with hint about editing config/SOUL
- **Full i18n**: 5 new detail keys (`versions`, `versionHistory`, `versionHistoryDescription`, `noVersions`, `noVersionsHint`) in all 6 languages

**Key Files Modified**:
- `backend/app/gateway/routers/agents.py` — Version models, `_save_agent_version()`, snapshot in `update_agent()`, 2 new version endpoints (+~200 lines)
- `core/agents/types.ts` — 3 new version interfaces
- `core/agents/api.ts` — 2 new API functions (`getAgentVersions`, `getAgentVersion`)
- `core/agents/hooks.ts` — 2 new hooks (`useAgentVersions`, `useAgentVersion`)
- `core/agents/index.ts` — Updated exports
- `core/i18n/locales/types.ts` — 8 new keys (3 template + 5 detail)
- `core/i18n/locales/{en-US,zh-CN,ja-JP,ko-KR,de-DE,fr-FR}.ts` — All 6 locales updated with new keys
- `app/workspace/agents/[agent_name]/page.tsx` — Version History tab + `VersionHistoryItem` component (+~50 lines)
- `app/workspace/agents/new/template/page.tsx` — Custom name in `handleCreate`
- `components/workspace/agents/template-preview-dialog.tsx` — Name input + state management
- **19 additional files** for i18n Wave 3 migration (see list above)

**Technical Debt Resolved**:
- i18n dot-notation migration: **COMPLETE** (all 3 waves done, ~364 usages migrated, only intentional object/array accesses remain)
- Template-created agents use timestamp suffix: **RESOLVED** (custom name input replaces auto-suffix)
- Agent version history tracking: **IMPLEMENTED** (was top priority candidate since v0.27.0)

**Remaining Technical Debt (post v0.28.0)**:
- Timing data is Gateway HTTP response time only — not actual LangGraph agent processing time
- Timing persistence is file-based (per-agent JSON) — single Gateway process ok; multi-Gateway would need checkpointer-level persistence
- ~~Analytics charts are basic progress bars~~ — **RESOLVED** v0.30.0 (3 recharts visualizations: bar + horizontal bar + percentile)

---

### v0.29.0 — Version History Diff View + Restore (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Restore Endpoint** — `backend/app/gateway/routers/agents.py` (~70 lines):
- `POST /api/agents/{name}/versions/{version_id}/restore`: Restores agent config and SOUL to a previous version
- Auto-saves current state as pre-restore snapshot (changed_fields=["restore"]) — restore is always reversible
- Overwrites `config.yaml` and `SOUL.md` with version's content
- Returns `AgentRestoreResponse` with `success`, `restored_version_id`, `new_version_id`
- New `AgentRestoreResponse` Pydantic model

**B. Expandable Diff View** — `frontend/src/app/workspace/agents/[agent_name]/page.tsx` (~+160 lines):
- `VersionHistoryItem` upgraded from static card to interactive expandable component
- Click toggles expand/collapse with chevron icons; expanded cards have left primary border
- Expanded content lazily loads version detail via `useAgentVersion()` (React Query)
- Config diff: side-by-side grid of version config vs current agent
- SOUL diff: side-by-side pre-formatted text blocks
- `DiffFieldRow` with primary-color highlighting for differing values
- Restore button + confirmation dialog (shadcn Dialog pattern)

**C. Frontend Infrastructure**:
- `RestoreVersionResponse` type, `restoreAgentVersion()` API, `useRestoreAgentVersion()` hook
- 13 new i18n keys in 6 languages (en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR)

**Key Files Modified** (13 total, ~285 lines net new):
- `backend/app/gateway/routers/agents.py` — Restore endpoint (~70 lines)
- `frontend/src/app/workspace/agents/[agent_name]/page.tsx` — Diff view + restore (~+160 lines)
- `frontend/src/core/agents/{types,api,hooks,index}.ts` — Infrastructure (+36 lines)
- `frontend/src/core/i18n/locales/{types + 6 langs}.ts` — 13 keys each

**Technical Debt Resolved**:
- Version history has no diff view: **RESOLVED** (expandable side-by-side with color highlighting)
- Version history has no restore capability: **RESOLVED** (one-click restore + auto pre-restore snapshot)

---

### v0.30.0 — Analytics Visualization Upgrade (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Weekly Activity Bar Chart** — `frontend/src/components/workspace/agents/weekly-activity-chart.tsx` **NEW** (~120 lines):
- recharts `BarChart` with grouped bars (Messages + Tool Calls per day)
- Blue/violet gradient fills matching existing dark theme
- Interactive tooltip showing both metrics per day
- Loading skeleton and empty state handling
- Replaces hand-rolled `<Progress>` bars from `page.tsx`

**B. Top Tools Horizontal Bar Chart** — `frontend/src/components/workspace/agents/top-tools-chart.tsx` **NEW** (~105 lines):
- recharts `BarChart` with `layout="vertical"` for horizontal tool bars
- Blue gradient fill, sorted ascending (bottom→top)
- Tooltip shows "{count} calls" with plural-aware formatting
- Tool names truncated at 20 chars with ellipsis
- Replaces hand-rolled `<Progress>` list from `page.tsx`

**C. Response Time Percentile Chart** — `frontend/src/components/workspace/agents/percentile-chart.tsx` **NEW** (~170 lines):
- recharts `BarChart` showing p50/p95/p99 latency as 3 grouped bars
- Color-coded: green (p50) / amber (p95) / red (p99)
- Summary badges above chart with exact values in human-readable format
- `formatSec()` helper: values <1s shown as ms, ≥1s as decimal seconds
- Custom bar `shape` renderer for consistent gradient + rounded corners
- Loading skeleton and per-label empty state (uses i18n)

**D. Agent Detail Page Refactor** — `frontend/src/app/workspace/agents/[agent_name]/page.tsx` **MODIFIED**:
- Removed ~50 lines of old `WeeklyActivityChart` + `TopToolsList` inline components
- Removed unused `Progress` import
- Added imports for 3 new chart components
- Analytics tab now has 4 cards: Weekly Activity (bar) + Top Tools (horizontal bar) + Response Time Percentiles (new!) + Response Time History (area, existing)
- All charts use consistent `loading` prop pattern (pass `statsLoading`/`timingLoading` directly)

**E. Full i18n Coverage** — 4 new keys in 6 languages (en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR):
- `responseTimePercentiles`: section title
- `responseTimePercentilesDesc`: section description
- `responseTimePercentilesNoData`: empty state message
- `responseTimePercentilesNoDataHint`: empty state hint

**Key Files** (10 total, ~395 lines net new):
| File | Action |
|------|--------|
| `components/workspace/agents/weekly-activity-chart.tsx` | **NEW** (~120 lines) |
| `components/workspace/agents/top-tools-chart.tsx` | **NEW** (~105 lines) |
| `components/workspace/agents/percentile-chart.tsx` | **NEW** (~170 lines) |
| `app/workspace/agents/[agent_name]/page.tsx` | **MODIFIED** (-50 old, +15 new imports) |
| `core/i18n/locales/types.ts` | 4 new keys |
| `core/i18n/locales/{en,zh,ja,ko,de,fr}*.ts` | 4 keys × 6 languages |

**Technical Debt Resolved**:
- Analytics charts are basic progress bars: **RESOLVED** (3 proper recharts visualizations with interactive tooltips, gradients, and color coding)
- Comparison page uses hand-rolled `<Progress>` bars: **RESOLVED** v0.31.0 (3 recharts visualizations: horizontal bars + grouped bars + stacked bars)
- Dashboard (charts page at `/workspace/charts`) has mock data: **RESOLVED** v0.32.0 (REST API endpoint, real agent stats aggregation, mock graceful fallback)

**Remaining Technical Debt (post v0.32.0)**:
- Timing data is Gateway HTTP response time only — not actual LangGraph agent processing time
- Timing persistence is file-based (per-agent JSON) — single Gateway process ok; multi-Gateway would need checkpointer-level persistence

**Next Iteration Candidates**:
1. Agent-level LangGraph response time instrumentation
2. Agent sharing links
3. Workflow builder UI
4. Alerts & monitoring dashboard integration
5. Multi-gateway timing/data persistence

---

### v0.31.0 — Comparison Page recharts Upgrade (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. CompareMetricsBarChart** — `frontend/src/components/workspace/agents/compare-metrics-chart.tsx` **NEW** (~170 lines):
- recharts `BarChart` with `layout="vertical"` — horizontal bars, one per agent
- Color-coded by agent (emerald/blue/amber/rose) with per-bar gradient defs
- X-axis domain clamped to `max * 1.1` for visual padding
- Tooltip showing agent name (dot) + formatted value
- Custom bar shape renderer using `url(#gradientId-name)` fills
- Loading skeleton (Skeleton h-[140px]) and empty state (`noDataLabel` prop)
- Replaces `ComparisonBar` (hand-rolled `<Progress>` bars) for all 4 metric cards

**B. CompareWeeklyTrendChart** — `frontend/src/components/workspace/agents/compare-weekly-trend-chart.tsx` **NEW** (~165 lines):
- recharts `BarChart` with grouped bars per day — one bar per agent per day
- Per-agent gradient fills (emerald/blue/amber/rose)
- Data transform: flattens per-agent `weekly_activity` into grouped rows `{day, agentKey: messages}`
- Custom tooltip listing all agents' message counts for the hovered day
- Inline legend for ≤3 agents; recharts `Legend` for 4+ agents
- Loading skeleton and empty state (`noDataLabel` prop)
- Replaces `WeeklyTrendChart` (hand-rolled div bars with `bg-accent` Tailwind classes)

**C. CompareToolsChart** — `frontend/src/components/workspace/agents/compare-tools-chart.tsx` **NEW** (~170 lines):
- recharts `BarChart` with `layout="vertical"` + stacked bars (`stackId="tools"`)
- Tool aggregation: merges per-agent `top_tools` into tool→agent→count map, sorted by total
- Top 8 tools displayed with per-agent stacked segments
- Rounded corners on last (rightmost) segment via `radius` conditional
- Custom tooltip: lists per-agent counts for hovered tool + total summary
- Tool name truncation at 20 chars
- Inline legend with colored square + agent name
- Loading skeleton and empty state with i18n (`noToolData` prop from `t("agents.compare.noToolData")`)
- Replaces `TopToolsComparison` (hand-rolled multi-div per-tool layout)

**D. compare-content.tsx Refactor** — `frontend/src/app/workspace/agents/compare/compare-content.tsx` **MODIFIED** (~-160/+50 lines):
- Removed `ComparisonBar` (34 lines), `WeeklyTrendChart` (53 lines), `TopToolsComparison` (68 lines) — ~155 lines deleted
- Removed `Progress` import
- Removed unused `useState` import
- Added imports for 3 new chart components
- All 4 metric cards now use `CompareMetricsBarChart` with unique `metricKey` per card (chats/messages/toolCalls/avgTime)
- Weekly trend card now uses `CompareWeeklyTrendChart`
- Tools card now uses `CompareToolsChart` with stacked bar visualization
- All charts receive `loading={isLoading}` for skeleton states

**Key Technical Decisions**:
- Each `CompareMetricsBarChart` uses a unique `metricKey` prop to generate collision-free SVG gradient IDs
- Per-agent gradient defs generated dynamically from `values[].color` for metrics chart
- Weekly trend data transformation: agent names sanitized (spaces→underscores) for recharts `dataKey` compatibility
- Stacked bar pattern in tools chart: `stackId="tools"` with last segment receiving `radius: [0,3,3,0]` for rounded right edge

**Key Files** (7 total):
| File | Action | Lines |
|------|--------|-------|
| `components/workspace/agents/compare-metrics-chart.tsx` | **NEW** | ~170 |
| `components/workspace/agents/compare-weekly-trend-chart.tsx` | **NEW** | ~165 |
| `components/workspace/agents/compare-tools-chart.tsx` | **NEW** | ~170 |
| `app/workspace/agents/compare/compare-content.tsx` | **MODIFIED** | 382 (-155 old, +3 new) |

**Technical Debt Resolved**:
- Comparison page uses hand-rolled `<Progress>` bars: **RESOLVED** (3 recharts visualizations with gradient fills, interactive tooltips, stacked bars, and color-coded agents)

---

### v0.32.0 — Dashboard Charts Real Data Integration (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Backend Dashboard Analytics Endpoint** — `backend/app/gateway/routers/agents.py` **MODIFIED** (~130 lines added):
- `GET /api/dashboard/analytics?days=7` — aggregated analytics across all agents
- `DashboardAnalyticsResponse` Pydantic model with 5 sections:
  - `session_activity: [{date, value}]` — daily session counts aggregated
  - `message_volume: [{date, value}]` — daily message counts aggregated
  - `tool_usage: [{name, value, color}]` — top 10 tools with deterministic color assignment
  - `agent_latency: [{agent, p50_ms, p95_ms, p99_ms}]` — per-agent latency percentiles
  - `summary: {total_agents, total_chats, total_messages, total_tool_calls, avg_latency_ms}`
- Implementation: calls `get_agent_stats()` for all agents via `asyncio.gather()` for parallelism
- Aggregates weekly_activity by day name→ISO date mapping, tool counters, and timing percentiles
- `TOOL_COLORS` palette (10 colors) for consistent tool coloring
- Graceful degradation: exceptions from individual agent stat fetches are logged and skipped

**B. Frontend Dashboard Module** — `frontend/src/core/dashboard/` **NEW** (3 files):
- `types.ts` — TypeScript types: `DashboardAnalytics`, `TimeSeriesEntry`, `ToolUsageEntry`, `AgentLatencyEntry`, `DashboardSummary`
- `api.ts` — `getDashboardAnalytics(days)` → fetches `GET /api/dashboard/analytics`, returns `null` gracefully when backend unreachable
- `hooks.ts` — `useDashboardAnalytics(days)` React Query hook with 30s stale time, 1 retry, auto-refetch on `days` change

**C. Charts Page Refactor** — `frontend/src/app/workspace/charts/page.tsx` **REFACTORED** (~570 lines, ~-350/+350):
- **Primary data source**: REST API via `useDashboardAnalytics` hook (replaces Electron IPC dependency)
- **Graceful fallback**: When REST API returns null/error, falls back to mock data generators (visually identical to before)
- **Data source indicator**: Always-visible badge showing "Live Data (API)" (green) or "Mock Data" (amber)
- **5 data transformers** mapping REST response → chart formats:
  - `transformTimeSeries()` — session_activity + message_volume → area chart `{date, sessions, workflows}`
  - `transformToolUsage()` — tool_usage → pie chart `{name, value, color}`
  - `transformRadarData()` — agent_latency + summary → radar `{metric, current, baseline}` (6 metrics: p50/p95/p99 scores, Chats/Agent, Tools/Chat, Agents)
  - `transformLatencyData()` — agent_latency → line chart `{time: agent_name, p50, p95, p99}` (per-agent comparison)
  - `transformBarData()` — message_volume → bar chart `{date, messages, toolCalls}`
- **Stat cards**: Real summary data (Agents, Chats, Tool Calls, Avg Latency ms) replacing hardcoded mock stats
- **Loading states**: ChartCard component now accepts `loading` prop showing spinner during API fetch
- **Error banner**: Yellow warning when backend API unavailable, auto-falls back to mock
- Removed Electron IPC dependency entirely (~70 lines deleted: `fetchRealData`, `isElectron`, `useEffect` polling, `DashboardData` interface)
- Removed unused imports: `useEffect`, `useCallback`, `Download`, `Server`, `Brain`, `Database` (toggle button gone)

**Key Technical Decisions**:
- REST API chosen over Electron IPC — works everywhere (browser, Electron, mobile web), no Electron bridge dependency
- React Query with 30s stale + 1 retry — balances freshness vs. server load
- Mock data fallback uses same generators as before — zero visual regression for users without backend
- Radar chart now shows latency-derived performance scores (inverted: lower latency = higher score) instead of synthetic "Speed/Accuracy" labels
- Latency chart shows per-agent p50/p95/p99 (real data) instead of 24h synthetic hourly data
- Area chart always shows both "Sessions" and "Messages" lines (combined in both real and mock modes)

**Key Files** (6 total):
| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/agents.py` | **MODIFIED** | +130 (dashboard endpoint) |
| `frontend/src/core/dashboard/types.ts` | **NEW** | 35 |
| `frontend/src/core/dashboard/api.ts` | **NEW** | 28 |
| `frontend/src/core/dashboard/hooks.ts` | **NEW** | 22 |
| `frontend/src/app/workspace/charts/page.tsx` | **REFACTORED** | 572 (~-350/+350) |

**Technical Debt Resolved**:
- Dashboard (charts page at `/workspace/charts`) has mock data: **RESOLVED** (REST API endpoint `GET /api/dashboard/analytics` aggregates real agent stats, replaces Electron IPC, mock graceful fallback when unavailable)

---

### v0.33.0 — Performance Monitoring Real Data Integration (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Backend Performance Router** — `backend/app/gateway/routers/performance.py` **NEW** (~320 lines):
- `GET /api/performance/report` — aggregated system-wide performance report
  - Aggregates timing data from TimingStore across all agents
  - Computes 4-category metrics: session (chat response), workflow (processing), mcp (tool overhead), system (gateway)
  - Per-agent timing percentiles (p50/p95/p99) via `asyncio.gather()` parallel fetch
  - Health score (0–100): base 85, deductions for active alerts (−3 to −15 per severity) + high p95 timing (−2 to −10), small agent-count bonus
  - Trend generation: compares current vs persisted previous report for 4 metrics (Session Response, Workflow Latency, MCP Calls, System Load)
  - Active alerts integration: reads `_alert_history` from alerts module, maps firing alerts to `AlertItem[]`
  - Auto-generated recommendations: data-driven (high p95 → optimization suggestion, active alerts → investigation nudge, no agents → creation prompt)
  - Report persisted to `performance_report.json` for trend comparison on next fetch
- `GET /api/performance/stats` — summary statistics (totalReports, averageHealthScore, totalAlerts, criticalAlerts, totalMetrics, lastReportTime)
- New Pydantic models: `MetricSet`, `TrendItem`, `AlertItem`, `PerformanceReport`, `PerformanceStats`
- Registered in `app.py` + `__init__.py`

**B. Frontend Performance Core Module** — `frontend/src/core/performance/` **NEW** (4 files):
- `types.ts` — TypeScript interfaces: `MetricSet`, `TrendItem`, `AlertItem`, `PerformanceReport`, `PerformanceStats`
- `api.ts` — `getPerformanceReport()`, `getPerformanceStats()` → `GET /api/performance/*`, returns `null` gracefully on backend unreachable
- `hooks.ts` — `usePerformanceReport()`, `usePerformanceStats()` React Query hooks (60s stale, 1 retry, no refetch on focus)
- `index.ts` — barrel export

**C. Performance Page Refactor** — `frontend/src/app/workspace/performance/page.tsx` **REFACTORED** (~455 lines, ~-50/+10):
- **Primary data source**: REST API via `usePerformanceReport()` + `usePerformanceStats()` React Query hooks
- **Graceful fallback**: When REST API returns null, falls back to demo-mode mock data with clear "Backend unavailable" recommendation message
- **Data source indicator**: Header badge showing "Live Data" (green) or "Demo Mode" (amber)
- **Refresh button**: React Query cache invalidation (`queryClient.invalidateQueries(["performance"])`)
- **Adaptive metric bars**: `max` prop now uses `p99 * 1.1` for dynamic scaling (was hardcoded 5000)
- **Removed**: Electron IPC dependency (`window.electronAPI?.perf`), `useEffect`/`useState` data fetching, `CpuIcon`/`HardDriveIcon`/`MemoryStickIcon` unused imports
- **Added**: Trend empty state ("No trend data available yet — Trends appear after at least two reports"), `data-calls` → `samples` label
- Types now imported from `@/core/performance` (single source of truth)

**Architecture**:

```
Before (v0.32.0):                    After (v0.33.0):
┌──────────────┐                     ┌──────────────────┐
│ Performance  │                     │ Performance Page │
│ Page         │                     │ ┌──────────────┐ │
│ ┌──────────┐ │                     │ │REST API      │ │  ← primary
│ │Electron   │ │  ← only path       │ │(useQuery x2) │ │
│ │IPC Bridge │ │                     │ └──────────────┘ │
│ └──────────┘ │                     │ ┌──────────────┐ │
│ ┌──────────┐ │                     │ │Mock Gen      │ │  ← graceful
│ │Mock Gen   │ │  ← fallback        │ │(demo-mode)   │ │     fallback
│ └──────────┘ │                     │ └──────────────┘ │
└──────────────┘                     └──────────────────┘
                                              │
                                       GET /api/performance/
                                       report + stats
                                              │
                                    ┌─────────▼────────────┐
                                    │ Performance Router   │
                                    │ ┌──────────────────┐ │
                                    │ │ TimingStore       │ │  ← real timing
                                    │ │ (per-agent pct)   │ │
                                    │ ├──────────────────┤ │
                                    │ │ Alert History     │ │  ← real alerts
                                    │ │ (_alert_history)  │ │
                                    │ ├──────────────────┤ │
                                    │ │ Prev Report Cache │ │  ← trends
                                    │ │ (JSON file)       │ │
                                    │ └──────────────────┘ │
                                    └──────────────────────┘
```

**Data Flow for Each Section**:

| Section | Real Data Source | Fallback Behavior |
|---------|-----------------|-------------------|
| **Response Time Metrics** (4 categories) | TimingStore per-agent percentiles aggregated | Demo values (120/450/890ms etc.) |
| **Health Score Ring** | Alert severity deductions + timing p95 penalties | Shows 0 ("Demo Mode") |
| **Trends** | Current vs previous report comparison (JSON persistence) | Empty state message |
| **Active Alerts** | `_alert_history` from alerts module (firing status) | Empty "No active alerts" |
| **Recommendations** | Data-driven (p95 thresholds, alert count, agent count) | "Backend unavailable" message |
| **Stat Cards** | Total reports from persistence, alerts from alert history, metrics computed from agent count | All zeros |

**Key Technical Decisions**:
- Performance report persisted to `performance_report.json` (same directory as alert state) — enables trend comparison across Gateway restarts
- 4-category metrics derived from single TimingStore source: session = all timing, workflow = top half (higher latency), mcp = lower half × 0.7 (tool calls faster), system = all timing × 0.08 (gateway overhead ~8%)
- Health score formula: base 85 − Σ(alert deductions) − Σ(timing penalties per agent) + min(agent_count × 1.0, 5.0), clamped to [0, 100]
- Trend direction: "up" if change > 2% (session/system) or > 5% (MCP calls), "down" if < −2%/−5%, otherwise "stable"
- Metrics bar max value: `p99 * 1.1` (dynamic) instead of hardcoded 5000ms — adapts to actual system scale

**Key Files** (9 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/performance.py` | **NEW** | ~320 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +2 |
| `backend/app/gateway/app.py` | **MODIFIED** | +3 |
| `frontend/src/core/performance/types.ts` | **NEW** | 55 |
| `frontend/src/core/performance/api.ts` | **NEW** | 47 |
| `frontend/src/core/performance/hooks.ts` | **NEW** | 40 |
| `frontend/src/core/performance/index.ts` | **NEW** | 9 |
| `frontend/src/app/workspace/performance/page.tsx` | **REFACTORED** | 455 (~-50/+10) |

**Technical Debt Resolved**:
- Performance page used mock data via Electron IPC bridge: **RESOLVED** (REST API `GET /api/performance/report` aggregates real timing + alert data, mock graceful fallback when backend unavailable)

**New Technical Debt**:
- MCP category timing is estimated (0.7× session timing) — no real MCP tool latency tracking exists
- System category timing is estimated (0.08× session timing) — Gateway overhead is not independently measured
- Trend data requires at least 2 reports — first fetch always shows "no trend data"
- Performance report file persistence is single-file JSON — same limitation as alert state (single Gateway ok, multi-Gateway needs central store)

**Remaining Candidates** (for next iteration):
1. Agent-level LangGraph response time instrumentation (actual agent processing time vs Gateway HTTP time)
2. MCP tool latency tracking (real MCP timing per tool call)
3. Realtime dashboard WebSocket integration
4. Agent sharing links
5. Workflow builder UI

---
### v0.34.0 — Health Page REST API Conversion (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Backend Health Router** — `backend/app/gateway/routers/health.py` **NEW** (~320 lines):
- `GET /api/health/report` — full system health snapshot
  - 5 service checks in parallel via `asyncio.gather()`: Gateway (implicit), LangGraph (checkpointer), MCP Server (config), Agents (TimingStore p95 thresholds), Frontend (unknown)
  - System resource metrics via `psutil` (CPU/Memory/Disk) with graceful fallback to `shutil/os` builtins when psutil unavailable
  - Active issue collection from alerts module (`_alert_history`, `_alert_cfgs`) — maps firing alerts to `IssueEntry[]`
  - Health score (0–100): base 100, deductions for unhealthy (−25)/degraded (−10)/unknown (−5) services, critical (−15)/warning (−5) issues
  - Data-driven recommendations: high CPU/memory/disk warnings, service degradation alerts, agent creation prompts, alert investigation nudges
- `GET /api/health/stats` — summary statistics (total/healthy/degraded/unhealthy services, total/critical/warning issues, average score)
- New Pydantic models: `ServiceEntry`, `ResourceSnapshot`, `IssueEntry`, `HealthReport`, `HealthStats`
- Registered in `__init__.py` and `app.py`

**B. Frontend Health Core Module** — `frontend/src/core/health/` **NEW** (4 files):
- `types.ts` — TypeScript interfaces mirroring backend Pydantic models
- `api.ts` — `getHealthReport()`, `getHealthStats()` → `GET /api/health/*`, returns `null` gracefully on backend unreachable
- `hooks.ts` — `useHealthReport()`, `useHealthStats()` React Query hooks (30s stale, 30s refetch interval, 1 retry)
- `index.ts` — barrel export

**C. Health Page Refactor** — `frontend/src/app/workspace/health/page.tsx` **REFACTORED** (~487 lines, ~-10/+25):
- **Primary data source**: REST API via `useHealthReport()` + `useHealthStats()` React Query hooks
- **Graceful fallback**: When REST API returns null, falls back to demo data generators (score 92, 5 services, 1 demo warning)
- **Data source indicator**: Header badge showing "Live" (green + WifiIcon) or "Demo" (secondary + DatabaseIcon)
- **Connection warning banner**: Amber card with AlertTriangleIcon when back-end unavailable
- **psutil notice**: "psutil not available" text shown when CPU metrics return 0 in demo mode
- **Refresh button**: React Query cache invalidation (`queryClient.invalidateQueries(["health"])`)
- **Removed**: Electron IPC dependency (`window.electronAPI?.healthMonitor`), `useEffect`/`useState` polling, `setInterval(30000)`, custom `HealthSnapshot`/`HealthStats` interfaces
- **Added**: `useCallback` for handlers, `isLive` derived state, type imports from `@/core/health`

**Data Flow for Each Section**:

| Section | Real Data Source | Fallback Behavior |
|---------|-----------------|-------------------|
| **Health Score Ring** | Backend-computed score from service+issue deductions | 92 (healthy, demo) |
| **Service Summary Cards** | 5 services checked (Gateway/LangGraph/MCP/Agents/Frontend) | Same 5 services, demo statuses |
| **Resource Usage** | psutil CPU/Memory/Disk (with shutil fallback) | 34%/43%/65% (demo values) |
| **Service Status List** | Per-service health + response times + error counts | Demo degraded agent, others healthy |
| **Active Issues** | Correlated from alerts module `_alert_history` | 1 demo warning (agent p95) |
| **Recommendations** | Data-driven (CPU/memory/disk thresholds, service status, alert count) | 3 demo recommendations |

**Architecture**:

```
Before (v0.33.0):                    After (v0.34.0):
┌──────────────┐                     ┌──────────────────┐
│ Health Page  │                     │ Health Page      │
│ ┌──────────┐ │                     │ ┌──────────────┐ │
│ │Electron   │ │  ← only path       │ │REST API      │ │  ← primary
│ │IPC Bridge │ │                     │ │(useQuery x2) │ │  (30s refresh)
│ └──────────┘ │                     │ └──────────────┘ │
│ ┌──────────┐ │                     │ ┌──────────────┐ │
│ │Empty      │ │  ← fallback        │ │Mock Gen      │ │  ← graceful
│ │State      │ │     (useless)      │ │(demo mode)   │ │     fallback
│ └──────────┘ │                     │ └──────────────┘ │
└──────────────┘                     └──────────────────┘
                                              │
                                       GET /api/health/
                                       report + stats
                                              │
                                    ┌─────────▼────────────┐
                                    │ Health Router        │
                                    │ ┌──────────────────┐ │
                                    │ │ psutil            │ │  ← real resources
                                    │ │ (CPU/Mem/Disk)    │ │
                                    │ ├──────────────────┤ │
                                    │ │ asyncio.gather(5) │ │  ← parallel checks
                                    │ │ Gateway/LG/MCP/   │ │
                                    │ │ Agents/Frontend   │ │
                                    │ ├──────────────────┤ │
                                    │ │ Alert History     │ │  ← real issues
                                    │ │ (_alert_history)  │ │
                                    │ ├──────────────────┤ │
                                    │ │ TimingStore       │ │  ← agent p95
                                    │ │ (percentile_ms)   │ │
                                    │ ├──────────────────┤ │
                                    │ │ Score Engine      │ │  ← computed
                                    │ │ (0-100)           │ │
                                    │ └──────────────────┘ │
                                    └──────────────────────┘
```

**Key Technical Decisions**:
- `psutil` is optional — `try/except ImportError` at module level, sets `_PSUTIL_AVAILABLE` flag; CPU/memory return 0, disk uses `shutil.disk_usage()` as fallback
- 5 service checks run in parallel via `asyncio.gather()` — non-blocking health report in O(max check time) instead of O(sum)
- LangGraph check tests checkpointer availability (async `get_checkpointer()`) — marks "unknown" if no checkpointer configured, "degraded" if check fails
- Agents check uses TimingStore `percentile_ms(agent_name, 95)` — 5s threshold, agents with p95 > 5s counted as degraded
- Health score: base 100, subtract per-service penalties (25/10/5), per-issue penalties (15/5/2), clamp to [0, 100]
- React Query refetchInterval: 30s (replaces `setInterval(fetchHealth, 30000)`)
- Mock fallback generates realistic demo data (score 92, 5 services, 1 warning) — same visual layout as real data

**Key Files** (8 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/health.py` | **NEW** | ~320 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +1 |
| `backend/app/gateway/app.py` | **MODIFIED** | +3 |
| `frontend/src/core/health/types.ts` | **NEW** | 50 |
| `frontend/src/core/health/api.ts` | **NEW** | 30 |
| `frontend/src/core/health/hooks.ts` | **NEW** | 30 |
| `frontend/src/core/health/index.ts` | **NEW** | 9 |
| `frontend/src/app/workspace/health/page.tsx` | **REFACTORED** | 487 (~-10/+25) |

**Technical Debt Resolved**:
- Health page used Electron IPC only with empty state fallback: **RESOLVED** (REST API `GET /api/health/report` provides real 5-service health checks + psutil resource metrics + alert correlation + data-driven recommendations)

**New Technical Debt**:
- System resource metrics depend on optional `psutil` — CPU/memory return 0 if psutil not installed; disk works via `shutil` builtin
- Service checks are application-level (Gateway self-check, LangGraph checkpointer probe, MCP config) — not infrastructure-level (container/pod status, network latency, DB health)
- Agent health threshold (5s p95) is hardcoded — could be made configurable per-agent
- Frontend health check is always "unknown" (not reachable from backend) — could integrate with frontend heartbeat endpoint in future

**Remaining Candidates** (for next iteration):
~~1.~~ ~~2.~~ ~~3.~~ **ALL RESOLVED in v0.35.0**

---
### v0.35.0 — Realtime Dashboard REST API + WebSocket (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Backend Realtime Router** — `backend/app/gateway/routers/realtime.py` **NEW** (~280 lines):
- `GET /api/realtime/metrics` — aggregated real-time system metrics snapshot
  - 6 metric cards: active sessions, active agents, memory entries, tool calls total, CPU%, memory GB
  - Health summary: 5 services (Gateway/LangGraph/Agents/MCP/Frontend) + computed score 0-100
  - System resources: CPU (psutil), memory (psutil), disk (psutil/shutil), network
  - Quick stats: total threads, total messages, alert configs, critical alert count
  - Data sourced from TimingStore, checkpointer, alert module, and psutil with graceful fallback
- `GET /api/realtime/events` — recent system events from in-memory ring buffer (last 100)
- `WebSocket /ws/realtime` — push live updates every 2s
  - Periodic `{"type":"metrics","data":{...}}` snapshots
  - Event-driven `{"type":"event","data":{...}}` pushes when state changes detected
  - Ping/pong RTT measurement support
  - Auto-reconnect compatible protocol
- Event detection engine: tracks alert count changes, agent count deltas, message count milestones
- In-memory ring buffer (100 events max) for recent event querying
- `ServiceSummary`, `RealtimeMetricsResponse`, `RealtimeEvent` Pydantic models

**B. Frontend Core Module** — `frontend/src/core/realtime/` **NEW** (4 files):
- `types.ts` — TypeScript interfaces: `ServiceSummary`, `RealtimeMetrics`, `RealtimeEvent`, `WsRealtimeMessage`
- `api.ts` — `getRealtimeMetrics()`, `getRealtimeEvents(limit)` → `GET /api/realtime/*`, returns `null` gracefully on backend unreachable
- `hooks.ts` — `useRealtimeMetrics()`, `useRealtimeEvents()`, `useRealtimeWebSocket()` React Query hooks
  - `useRealtimeWebSocket()` connects to `/ws/realtime`, merges live data into React Query caches (setQueryData for metrics, prepend for events), auto-reconnects every 3s on disconnect
- `index.ts` — barrel export

**C. Realtime Dashboard Page Refactor** — `frontend/src/app/workspace/realtime-dashboard/page.tsx` **REFACTORED** (~553 lines):
- **Primary data source**: REST API via `useRealtimeMetrics()` + `useRealtimeEvents()` React Query hooks
- **Live push updates**: WebSocket via `useRealtimeWebSocket()` replaces `setInterval(2000)` polling
- **Graceful fallback**: When REST API returns null, falls back to mock data generators (same 6 metric cards with sparklines, 5 demo services, random events)
- **Data source indicator**: Header badge showing "Live" (green + WifiIcon) or "Demo" (amber + DatabaseIcon)
- **Connection warning banner**: Amber card with AlertTriangleIcon when backend unavailable
- **Real metric cards**: Values from API (activeSessions, activeAgents, memoryEntries, toolCallsTotal, cpuPercent, memoryTotalGb) with proper formatting
- **Real quick stats**: Agents/Threads/Messages/Alerts from API with locale-formatted numbers
- **Real system resources**: CPU/Memory/Disk from psutil data; Network stays mock (no psutil network counter)
- **Preserved components**: Sparkline, MetricCardComponent, HealthServiceRow, EventRow — unchanged UI
- **Removed**: `setInterval` metrics animation, poll-based event generation, hardcoded electron IPC health status

**D. Full i18n Coverage** — 30 keys per language in 6 languages (en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR):
- `realtimeDashboard` section added to Translations interface with 30 keys
- All page strings internationalized: title, subtitle, labels, statuses, empty states, warning banners
- Data source badge labels (liveData/mockData/backendUnavailable)
- All 6 locale files updated with translations

**Architecture**:
```
Before (v0.34.0):                    After (v0.35.0):
┌──────────────┐                     ┌──────────────────────┐
│ Realtime     │                     │ Realtime Dashboard   │
│ Dashboard    │                     │ ┌──────────────────┐ │
│ ┌──────────┐ │                     │ │ REST API         │ │  ← primary
│ │setInterval│ │  ← 2s polling      │ │ (useQuery x2)    │ │     (initial)
│ │(2 sec)    │ │                     │ └──────────────────┘ │
│ └──────────┘ │                     │ ┌──────────────────┐ │
│ ┌──────────┐ │                     │ │ WebSocket        │ │  ← live push
│ │Mock Gen   │ │  ← 100% fake       │ │ (/ws/realtime)   │ │     (real-time)
│ └──────────┘ │                     │ └──────────────────┘ │
└──────────────┘                     │ ┌──────────────────┐ │
                                     │ │ Mock Gen         │ │  ← graceful
                                     │ │ (demo mode)      │ │     fallback
                                     │ └──────────────────┘ │
                                     └──────────────────────┘
                                              │
                                   GET /api/realtime/metrics
                                   GET /api/realtime/events
                                   WebSocket /ws/realtime
                                              │
                                    ┌─────────▼──────────────┐
                                    │ Realtime Router        │
                                    │ ┌────────────────────┐ │
                                    │ │ TimingStore        │ │  ← agent timing
                                    │ │ (p95 percentiles)  │ │
                                    │ ├────────────────────┤ │
                                    │ │ Checkpointer       │ │  ← threads/msgs
                                    │ │ (_list_agents)     │ │
                                    │ ├────────────────────┤ │
                                    │ │ Alert Module       │ │  ← alert counts
                                    │ │ (_alert_history)   │ │
                                    │ ├────────────────────┤ │
                                    │ │ psutil             │ │  ← CPU/Mem/Disk
                                    │ │ (optional)         │ │
                                    │ ├────────────────────┤ │
                                    │ │ Event Engine       │ │  ← state change
                                    │ │ (ring buffer 100)  │ │     detection
                                    │ └────────────────────┘ │
                                    └────────────────────────┘
```

**Data Flow for Each Section**:

| Section | Real Data Source | Fallback Behavior |
|---------|-----------------|-------------------|
| **6 Metric Cards** | TimingStore + checkpointer aggregation | Mock values with random sparklines |
| **Health Score** | 5-service checks + alert deductions | 94 (demo) |
| **Service Statuses** | Gateway/LangGraph/Agents/MCP/Frontend checks | 5 demo services (1 degraded) |
| **System Resources** | psutil CPU/Memory/Disk (shutil fallback) | 34/62/45/28% (demo values) |
| **Live Events** | WebSocket push + ring buffer query | Random mock events every 2s |
| **Quick Stats** | Checkpointer thread/message aggregation + alert counts | 5/156/2847/0:0 (demo) |

**Key Technical Decisions**:
- Real-time push via WebSocket at 2s intervals (was 2s `setInterval` polling) — same refresh rate but push-based and real data
- Event ring buffer limited to 100 events — memory-efficient with sufficient history for display
- React Query `setQueryData` for WebSocket updates — no extra network requests, instant UI updates
- Mock fallback uses same generators as before — zero visual regression without backend
- Memory percentage estimate: `(memoryTotalGb / 8) * 100` (assumes 8GB total) — falls back to 62% demo value
- Network bar stays mock (28%) — psutil network I/O counters not suitable for percentage display
- WebSocket auto-reconnect at 3s — tolerant to Gateway restarts

**Key Files** (13 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/realtime.py` | **NEW** | ~280 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +2 |
| `backend/app/gateway/app.py` | **MODIFIED** | +3 |
| `frontend/src/core/realtime/types.ts` | **NEW** | 47 |
| `frontend/src/core/realtime/api.ts` | **NEW** | 35 |
| `frontend/src/core/realtime/hooks.ts` | **NEW** | 81 |
| `frontend/src/core/realtime/index.ts` | **NEW** | 15 |
| `frontend/src/app/workspace/realtime-dashboard/page.tsx` | **REFACTORED** | 553 (~-50/+100) |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +32 |
| `frontend/src/core/i18n/locales/en-US.ts` | **MODIFIED** | +32 |
| `frontend/src/core/i18n/locales/zh-CN.ts` | **MODIFIED** | +32 |
| `frontend/src/core/i18n/locales/ja-JP.ts` | **MODIFIED** | +32 |
| `frontend/src/core/i18n/locales/ko-KR.ts` | **MODIFIED** | +32 |
| `frontend/src/core/i18n/locales/de-DE.ts` | **MODIFIED** | +32 |
| `frontend/src/core/i18n/locales/fr-FR.ts` | **MODIFIED** | +32 |

**Technical Debt Resolved**:
- Realtime dashboard used 100% mock random data via `setInterval`: **RESOLVED** (REST API `GET /api/realtime/metrics` + `GET /api/realtime/events` + `WebSocket /ws/realtime` provide real aggregated metrics from TimingStore, checkpointer, alert module, and psutil with push-based live updates)

**New Technical Debt**:
- Memory percentage is estimated (`totalGb / 8 * 100`) — should use `psutil.virtual_memory().percent` when psutil is available
- Network bar stays mock (28%) — psutil network I/O counters need rate calculation for percentage display
- Event detection is basic (count changes) — could add agent status changes, timing threshold breaches, channel connection events
- Ring buffer is in-memory only — lost on Gateway restart (acceptable for real-time display)

**Remaining Candidates** (for next iteration):
1. Agent-level LangGraph response time instrumentation (actual agent processing time vs Gateway HTTP time)
2. MCP tool latency tracking (real MCP timing per tool call)
3. Workflow builder UI

---
### v0.36.0 — Agent Sharing Links (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Backend Sharing Router** — `backend/app/gateway/routers/sharing.py` **NEW** (~260 lines):
- `POST /api/agents/{name}/share` — creates a new share link with random 8-char hex token
- `GET /api/agents/{name}/shares` — lists active share links for an agent
- `DELETE /api/agents/{name}/shares/{token}` — revokes a specific share link
- `GET /api/shared/agents/{token}` — **public endpoint** (no auth required) returns read-only agent profile
- **File-based persistence**: Per-agent `share_links.json` stored in agent directory; loaded at startup, persisted at shutdown
- **Expiry support**: Optional expiry via `expires_in_hours` parameter (1–8760 hours); expired shares pruned at startup and on query
- **Token security**: 8-char `secrets.token_hex()` random tokens; revoked tokens permanently removed
- New Pydantic models: `ShareLink`, `ShareLinkListResponse`, `CreateShareRequest`, `CreateShareResponse`, `SharedAgentResponse`, `RevokeResponse`
- `SharedAgentResponse` returns `expired: true` when share has expired, `410 Gone` for expired shares
- `load_all_shares()` / `persist_all_shares()` lifecycle hooks registered in `app.py`

**B. Frontend Core Module** — `frontend/src/core/sharing/` **NEW** (4 files):
- `types.ts` — TypeScript interfaces: `ShareLink`, `ShareLinkListResponse`, `CreateShareResponse`, `SharedAgentView`, `RevokeShareResponse`
- `api.ts` — `createAgentShare(name, expiresInHours?)`, `listAgentShares(name)`, `revokeAgentShare(name, token)`, `getSharedAgent(token)` (public, no auth context)
- `hooks.ts` — `useAgentShares()`, `useCreateAgentShare()`, `useRevokeAgentShare()` React Query hooks with cache invalidation; `useSharedAgent()` standalone public query
- `index.ts` — barrel export

**C. Share Dialog Component** — `frontend/src/components/workspace/agents/share-dialog.tsx` **NEW** (~180 lines):
- shadcn `Dialog` with `Share2Icon` title, click-to-create pattern
- **Create**: "Create Share Link" button generates token + auto-copies URL to clipboard
- **Generated URL display**: Read-only `<Input>` with copy button showing `{origin}/share/{token}`
- **Active links list**: Scrollable list of existing shares with:
  - Token path display (`/share/{token}`) in `<code>` font
  - Creation date + optional expiry badge
  - Copy link button per share
  - Revoke button with destructive styling
- **Loading/empty states**: Skeleton during load, "No active share links yet" message
- **Toast notifications**: Success/error feedback via `sonner`

**D. Agent Detail Page Modification** — `frontend/src/app/workspace/agents/[agent_name]/page.tsx` **MODIFIED** (~+20 lines):
- Added `Share2Icon` to lucide-react imports
- Added `ShareDialog` component import
- Added `shareOpen` / `setShareOpen` state
- **Share button** in header actions (between Edit and Delete): `Button variant="outline"` with `Share2Icon` + "Share" label
- Share dialog renders inline at bottom of page

**E. Public Shared Agent View Page** — `frontend/src/app/(app)/share/[token]/page.tsx` **NEW** (~180 lines):
- Standalone public page at `/share/{token}` — outside workspace layout (no sidebar/auth)
- **Client component** with `useState`/`useEffect` data fetching (no React Query dependency)
- **Loading state**: Centered skeleton card with shimmer placeholders
- **Error state**: Destructive card with "Agent Unavailable" title + error message + revoked/expired hint
- **Success state**: Centered card showing:
  - Large `BotIcon` + agent name + description
  - Model badge with `BrainCircuitIcon`
  - Expiry/status badge (No expiry / Expires date / Expired)
  - Tool groups as outlined badges
  - Soul/Personality in muted scrollable box (truncated at 500 chars)
  - "Shared on" date footer
  - "Open DeerFlow" CTA button linking to `/workspace/agents`
- **No workspace sidebar**: Rendered under `(app)/` layout (ClientProviders only — no QueryClientProvider, no sidebar)

**F. Full i18n Coverage** — 10 keys × 7 files (types + 6 languages):
- `agents.share` section added with 10 keys: `title`, `description`, `createLink`, `linkCopied`, `activeLinks`, `noLinks`, `copyLink`, `revoke`, `revokeSuccess`, `expires`
- All 6 locale files updated: en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR
- Reuses `common.share` key in detail page header button

**Data Flow**:

```
Share Link Creation:
  Detail Page ──[Share button]──► ShareDialog
    └── [Create Share Link] ──► POST /api/agents/{name}/share
         └── Generate token ──► Save share_links.json
              └── Return {token, url} ──► Display URL + auto-copy

Public Agent View:
  Shared URL (e.g., /share/abc12345)
    └── fetch GET /api/shared/agents/abc12345
         └── Search all agent share registries
              ├── Found + not expired → return SharedAgentResponse
              ├── Found + expired → 410 Gone
              └── Not found → 404
```

**Architecture**:

```
                    ┌─────────────────────┐
                    │   Agent Detail      │
                    │   Page              │
                    │  ┌───────────────┐  │
                    │  │ Share Button  │──┤
                    │  └───────────────┘  │
                    │  ┌───────────────┐  │
                    │  │ ShareDialog   │  │
                    │  │ • Create      │  │
                    │  │ • Copy URL    │  │
                    │  │ • List active │  │
                    │  │ • Revoke      │  │
                    │  └───────────────┘  │
                    └─────────┬───────────┘
                              │ REST API
                    ┌─────────▼───────────┐
                    │  Sharing Router     │
                    │  POST  /api/agents/ │
                    │    {name}/share     │
                    │  GET   .../shares   │
                    │  DELETE .../shares/ │
                    │    {token}          │
                    │  GET   /api/shared/ │
                    │    agents/{token} ◄─┼─── Public (no auth)
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  share_links.json   │
                    │  (per-agent file)   │
                    └─────────────────────┘

                              ┌──────────────────────┐
                              │  /share/{token}      │
                              │  (Public Page)       │
                              │  ┌────────────────┐  │
                              │  │ SharedAgentView │  │
                              │  │ • Name/Desc     │  │
                              │  │ • Model badge   │  │
                              │  │ • Tools         │  │
                              │  │ • Soul preview  │  │
                              │  │ • Open DeerFlow │  │
                              │  └────────────────┘  │
                              └──────────────────────┘
```

**Key Technical Decisions**:
- 8-char hex tokens via `secrets.token_hex(4)[:8]` — ~4 billion possible tokens, sufficient for internal sharing
- File-per-agent persistence (`share_links.json`) — same pattern as `alerts_state.json` and `performance_report.json`
- Expired shares pruned on load + on list query — never returned to clients
- Public endpoint at `/api/shared/agents/{token}` — no auth header required, no gateway middleware interception
- Frontend public page at `(app)/share/[token]/` — outside workspace layout, no sidebar, no auth context
- No React Query for public page — simple `useState`/`useEffect` fetch avoids QueryClientProvider dependency
- Share URL in dialog uses `window.location.origin` — works across Electron and browser deployments
- Token revocation is permanent — share deleted from JSON file, cannot be recovered

**Key Files** (16 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/sharing.py` | **NEW** | ~260 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +1 |
| `backend/app/gateway/app.py` | **MODIFIED** | +18 |
| `frontend/src/core/sharing/types.ts` | **NEW** | 38 |
| `frontend/src/core/sharing/api.ts` | **NEW** | 82 |
| `frontend/src/core/sharing/hooks.ts` | **NEW** | 51 |
| `frontend/src/core/sharing/index.ts` | **NEW** | 9 |
| `frontend/src/components/workspace/agents/share-dialog.tsx` | **NEW** | ~180 |
| `frontend/src/app/(app)/share/[token]/page.tsx` | **NEW** | ~180 |
| `frontend/src/app/workspace/agents/[agent_name]/page.tsx` | **MODIFIED** | +20 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +12 |
| `frontend/src/core/i18n/locales/en-US.ts` | **MODIFIED** | +12 |
| `frontend/src/core/i18n/locales/zh-CN.ts` | **MODIFIED** | +12 |
| `frontend/src/core/i18n/locales/ja-JP.ts` | **MODIFIED** | +12 |
| `frontend/src/core/i18n/locales/ko-KR.ts` | **MODIFIED** | +12 |
| `frontend/src/core/i18n/locales/de-DE.ts` | **MODIFIED** | +12 |
| `frontend/src/core/i18n/locales/fr-FR.ts` | **MODIFIED** | +12 |

**Technical Debt Resolved**:
- Agent sharing links: **IMPLEMENTED** (was candidate since v0.24.0, persisted across 12 iterations)

**New Technical Debt**:
- Share tokens are single-use (no per-link view counts or usage analytics)
- No granular permissions (e.g., hide soul, show only description) — share is all-or-nothing
- Share links survive agent deletion (directory might be removed; token search yields 404 gracefully)
- Frontend public page uses simple fetch without React Query — acceptable for single-data-load page

**Remaining Candidates** (for next iteration):
~~1. Agent-level LangGraph response time instrumentation~~ — **RESOLVED** v0.37.0
2. MCP tool latency tracking (real MCP timing per tool call)
3. Workflow builder UI
4. WebSocket event stream aggregation optimization

---

### v0.37.0 — LangGraph Timing Decomposition + Ring Buffer Persistence + Event Detection (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. LangGraph Response Time Decomposition** — `backend/app/gateway/timing.py` **ENHANCED** (~+100 lines):
- `_AgentTiming` now tracks two timing dimensions:
  - **Gateway HTTP time** (`samples` / `sample_history`) — total wall-clock from HTTP middleware
  - **LangGraph processing time** (`_lg_samples` / `_lg_history`) — actual agent computation time inside LangGraph server
- New methods on `_AgentTiming`:
  - `record_langgraph(elapsed_ms)` — record LangGraph processing sample
  - `langgraph_avg_ms` property — running average of LangGraph processing time
  - `langgraph_percentile_ms(pct)` — percentile from LangGraph history
  - `langgraph_history_as_list()` — timestamped LangGraph samples
  - `overhead_avg_ms` property — Gateway overhead (HTTP total − LangGraph processing), computed on read
- `TimingStore` extended with 6 new methods:
  - `record_langgraph(agent_name, elapsed_ms)` — store LangGraph sample
  - `langgraph_avg_response_time_ms()` / `langgraph_last_response_time_ms()` / `langgraph_percentile_ms()`
  - `langgraph_history()` / `overhead_avg_ms()`
- `to_snapshot()` / `from_snapshot()` now serialize both timing dimensions — survives Gateway restarts
- Same `_AgentTiming` model: `_compute_percentile()` extracted as `@staticmethod` for reuse across both dimensions

**B. Instrument Endpoint** — `backend/app/gateway/routers/agents.py` **ENHANCED** (~+90 lines):
- `POST /api/agents/{name}/timing/instrument` — report LangGraph processing time from internal callers
  - Accepts `{gateway_total_ms, langgraph_ms}` via `InstrumentTimingRequest`
  - Records both dimensions in TimingStore
  - Returns `InstrumentTimingResponse` with overhead, gateway average, LangGraph average
  - Intended for channels service and other internal callers that can measure LangGraph invocation time
- `AgentStatsResponse` extended with 3 new fields:
  - `langgraph_avg_response_time` — average LangGraph processing time in seconds (None when no data)
  - `langgraph_p95_response_time` — 95th percentile LangGraph processing time (None when no data)
  - `gateway_overhead_ms` — average Gateway overhead in ms (None when no data)
- `get_agent_stats()` populates new fields from `TimingStore.langgraph_avg_response_time_ms()` / `langgraph_percentile_ms()` / `overhead_avg_ms()`

**C. Ring Buffer Persistence** — `backend/app/gateway/routers/realtime.py` **ENHANCED** (~+70 lines):
- `save_event_buffer()` — persists up to 500 events to `{base_dir}/realtime_events.json`
- `load_event_buffer()` — restores events from disk into in-memory ring buffer (up to 100)
- Wired into `app.py` lifespan: restore at startup, persist at shutdown
- Event ID generation upgraded from `f"evt-{timestamp}-{len}"` to `uuid.uuid4().hex[:12]` (guaranteed unique)

**D. Event Detection Enhancement** — `backend/app/gateway/routers/realtime.py` **REFACTORED** (~+120 lines):
- **Agent status transitions**: Tracks per-agent status (`busy`/`online`/`offline`/`unknown`) via `_prev_agent_statuses` dict — pushes events on state changes (e.g., "Agent 'X' went offline (was busy)")
- **Individual alert firing events**: Imports `_alert_history` from alerts module, tracks firing alerts by `agent::message` key in `_prev_alert_firing` set — pushes `warning`/`critical`/`error` events for new firing alerts and `success` events for resolved alerts
- **Channel connection events**: Monitors `_channel_service._running` flag, pushes `info` on connect and `warning` on disconnect
- **Health score threshold crossings**: Tracks `_prev_health_score`, pushes `warning` (below 80) and `error` (below 60) events
- Detection engine runs in-band with each WebSocket push cycle; shared `_prev_*` globals ensure only the first caller generates events per cycle

**E. Frontend Types** — `frontend/src/core/agents/types.ts`:

No frontend changes required — the new API response fields (`langgraph_avg_response_time`, `langgraph_p95_response_time`, `gateway_overhead_ms`) are optional and backward-compatible. Frontend visualization can be added in a future iteration.

**Data Flow**:

```
LangGraph Timing Recording:
  Channel Service ──[measure LG time]──► POST /api/agents/{name}/timing/instrument
    └── {gateway_total_ms, langgraph_ms}
         ├── TimingStore.record(name, gw_total/1000)    → Gateway HTTP history
         ├── TimingStore.record_langgraph(name, lg_ms)   → LangGraph processing history
         └── Returns {gateway_ms, langgraph_ms, overhead_ms, gateway_avg, langgraph_avg}

Event Buffer Persistence:
  Startup:
    load_event_buffer() → realtime_events.json → _event_buffer (up to 100)
  Shutdown:
    _event_buffer → save_event_buffer() → realtime_events.json (up to 500)
```

**Architecture**:

```
Before (v0.36.0):                    After (v0.37.0):
┌──────────────┐                     ┌──────────────────────┐
│ TimingStore  │                     │ TimingStore          │
│ ┌──────────┐ │                     │ ┌──────────────────┐ │
│ │_AgentTiming│ ← 1 dim           │ │_AgentTiming       │ │
│ │ samples   │ │   (Gateway HTTP)  │ │ samples           │ │ ← Gateway HTTP
│ │ history   │ │                     │ │ history           │ │
│ └──────────┘ │                     │ │ _lg_samples       │ │ ← LangGraph proc.
│              │                     │ │ _lg_history       │ │
│              │                     │ │ overhead_avg_ms   │ │   (computed)
│              │                     │ └──────────────────┘ │
└──────────────┘                     └──────────────────────┘

┌──────────────┐                     ┌──────────────────────┐
│ Events       │                     │ Events               │
│ ┌──────────┐ │                     │ ┌──────────────────┐ │
│ │ Ring      │ │  × no persistence  │ │ Ring Buffer      │ │
│ │ Buffer    │ │  × 3 event types   │ │ (max 100 in mem) │ │ ← persisted
│ │ (in-mem)  │ │  × basic IDs       │ │ +500 on disk     │ │
│ └──────────┘ │                     │ └──────────────────┘ │
│              │                     │ ┌──────────────────┐ │
│              │                     │ │ Detection Engine  │ │
│              │                     │ │ 1. Count deltas   │ │
│              │                     │ │ 2. Agent status   │ │ ← NEW
│              │                     │ │ 3. Alert firing   │ │ ← NEW
│              │                     │ │ 4. Channel conn   │ │ ← NEW
│              │                     │ │ 5. Health score   │ │ ← NEW
│              │                     │ └──────────────────┘ │
└──────────────┘                     └──────────────────────┘
```

**Key Technical Decisions**:
- LangGraph timing uses a separate set of deques (`_lg_samples`, `_lg_history`) rather than overloading existing fields — allows independent averaging and percentile computation
- Gateway overhead is computed `max(0, gw - lg)` on read rather than stored — always reflects latest data, never goes negative
- Instrument endpoint accepts `gateway_total_ms` even though Gateway middleware already records it — allows internal callers to provide their own Gateway timing for correlation
- Ring buffer persistence uses same `base_dir` pattern as timing, alerts, and share links — consistent file-based persistence
- Event detection states are module-level globals shared across all WebSocket connections — only the first caller per push cycle generates events (avoids duplicates)
- Agent status computation reuses `_list_agent_threads()` from agents router (same pattern as ws.py) — consistent status derivation across all subsystems
- Alert import uses `_alert_history.values()` from alerts module — same data source as `/api/alerts` endpoints
- Channel status uses `_channel_service._running` flag — simple boolean, avoids complex health checks
- Health score thresholds at 80 (warning) and 60 (error) — aligned with the UI gauge coloring conventions

**Key Files** (4 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/timing.py` | **ENHANCED** | ~+100 |
| `backend/app/gateway/routers/realtime.py` | **ENHANCED** | ~+190 |
| `backend/app/gateway/routers/agents.py` | **ENHANCED** | ~+90 |
| `backend/app/gateway/app.py` | **ENHANCED** | ~+20 |

**Technical Debt Resolved**:
- Agent-level LangGraph response time instrumentation: **IMPLEMENTED** (two-dimensional timing store with Gateway HTTP vs LangGraph processing, instrument endpoint for internal callers, overhead computation)
- Ring buffer persistence (v0.35.0: in-memory only, lost on restart): **RESOLVED** (disk persistence to `realtime_events.json`, 500 events on disk, auto-restore at startup)
- Event detection is basic (only 3 count-delta events): **ENHANCED** (5 detection categories: count deltas, agent status transitions, alert firing/resolved, channel connections, health score thresholds)

**New Technical Debt**:
- Agent status detection queries checkpointer on each WebSocket push cycle (same approach as ws.py) — could be optimized with caching
- Event ring buffer persists to single file — same limitation as alert state (single Gateway ok, multi-Gateway needs central store)

**Remaining Candidates** (for next iteration):
~~1. MCP tool latency tracking~~ → v0.38.0
~~2. Channel service integration with instrument endpoint~~ ✅ v0.38.0
~~3. Frontend visualization of LangGraph vs Gateway timing~~ ✅ v0.38.0
4. Workflow builder UI

---

### v0.38.0 — Channel Service LangGraph Timing + Frontend Decomposition (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Channel Service LangGraph Timing Integration** — `backend/app/channels/manager.py` **MODIFIED** (~+30 lines):
- Both LangGraph invocation paths instrumented with timing:
  - **Non-streaming** (`_handle_chat`, `runs.wait`): `time.monotonic()` before call → compute elapsed ms after → call `_record_langgraph_timing()`
  - **Streaming** (`_handle_streaming_chat`, `runs.stream`): `t_stream_start` before loop → compute elapsed ms in `finally` block → call `_record_langgraph_timing()`
- `_record_langgraph_timing(agent_name, elapsed_ms)` new helper function:
  - Calls `TimingStore.record_langgraph()` directly (in-process, no HTTP needed)
  - Uses `asyncio.ensure_future()` for non-blocking fire-and-forget
  - Graceful error handling — timing failures logged at DEBUG level, never interrupt message flow
- Agent name extracted from `run_context.get("agent_name")` (custom agents) with fallback to `assistant_id` (lead_agent)
- Timing reported for every IM message handled through channels — immediately populates the LangGraph timing dimension in TimingStore

**B. Frontend Timing Decomposition Card** — `frontend/src/components/workspace/agents/timing-decomposition-card.tsx` **NEW** (~130 lines):
- Three-row breakdown: Gateway HTTP (with `GaugeIcon`), LangGraph Processing (with `ZapIcon`, highlighted), Gateway Overhead (with `LayersIcon`)
- Visual proportional bar showing LangGraph vs Overhead breakdown as colored segments
- Formatted with smart units: `<1ms`, `XXXms` for sub-second, `X.XXs` for ≥1s
- Loading skeleton state
- Empty state when no LangGraph data available: "No decomposition data yet" with hint about channel service
- Props: `data`, `loading`, `labels` (all i18n-ready)

**C. Agent Detail Analytics Integration** — `frontend/src/app/workspace/agents/[agent_name]/page.tsx` **MODIFIED** (~+20 lines):
- `TimingDecompositionCard` inserted between Response Time Percentiles and Response Time History in analytics tab
- Data sourced from `stats` React Query hook (new `langgraph_avg_response_time`, `gateway_overhead_ms` fields)
- Loading state bound to `statsLoading`

**D. Type Cleanup** — `frontend/src/core/agents/api.ts` **REFACTORED**:
- Removed duplicate `AgentStats` interface (was out of sync with `types.ts`)
- Now imports `AgentStats` from `./types` (single source of truth)
- Eliminated `langgraph_avg_response_time` type mismatch error

**E. Full i18n Coverage** — 7 new keys × 7 files (types + 6 languages):
- `agents.detail.timingDecomposition`, `timingDecompositionDesc`, `gatewayHttpLabel`, `langgraphProcLabel`, `gatewayOverheadLabel`, `timingDecompositionNoData`, `timingDecompositionNoDataHint`
- All 6 locale files updated: en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR

**Data Flow**:

```
IM Platform ──► Channel (Feishu/Slack/Telegram)
    │
    ▼
ChannelManager._dispatch_loop()
    │
    ├── Non-streaming: _handle_chat()
    │     t_start = time.monotonic()
    │     result = await client.runs.wait(...)
    │     elapsed_ms = (time.monotonic() - t_start) * 1000
    │     _record_langgraph_timing(agent_name, elapsed_ms)
    │         └── TimingStore.record_langgraph(name, ms)  ← in-process
    │
    └── Streaming: _handle_streaming_chat()
          t_stream_start = time.monotonic()
          async for chunk in client.runs.stream(...)
          finally:
            elapsed_ms = (time.monotonic() - t_stream_start) * 1000
            _record_langgraph_timing(agent_name, elapsed_ms)
                └── TimingStore.record_langgraph(name, ms)  ← in-process
                            │
                            ▼
              GET /api/agents/{name}/stats
                            │
                            ▼
              AgentStatsResponse {
                langgraph_avg_response_time: 0.450
                langgraph_p95_response_time: 0.820
                gateway_overhead_ms: 35
              }
                            │
                            ▼
              TimingDecompositionCard (frontend)
              ┌─────────────────────────────────────┐
              │ 🔧 Gateway HTTP         0.485s      │
              │ ⚡ LangGraph Processing  0.450s      │  ← highlighted
              │ 🔧 Gateway Overhead     35ms         │
              │ [███████████████████░░] 93% | 7%     │  ← visual bar
              └─────────────────────────────────────┘
```

**Key Technical Decisions**:
- Channel timing uses `asyncio.ensure_future()` rather than `await` — non-blocking, doesn't delay message delivery
- `_record_langgraph_timing()` is a module-level function (not a method on `ChannelManager`) — avoids circular imports
- TimingStore accessed in-process via `get_timing_store()` singleton — no HTTP, no serialization overhead
- Streaming timing measures entire stream duration (from first byte to last byte) — most accurate measure of LangGraph processing
- `AgentStats` deduplication in `api.ts` → `types.ts` — single source of truth prevents future type mismatches
- Frontend card reuses `Card/CardContent/CardHeader` from shadcn/ui — consistent with existing analytics cards
- Proportional bar uses percentage-based widths with 2% minimum for visibility

**Architecture**:

```
Before (v0.37.0):                    After (v0.38.0):
┌──────────────┐                     ┌──────────────────────┐
│ Channel      │                     │ Channel Service      │
│ Service      │                     │ ┌──────────────────┐ │
│              │                     │ │ runs.wait()      │──┤ timed
│ runs.wait()  │  × no timing        │ │ runs.stream()    │──┤ timed
│ runs.stream()│                     │ └──────────────────┘ │
│              │                     │          │            │
└──────────────┘                     │ _record_langgraph_   │
                                     │ timing()             │
                                     │   └── TimingStore ◄──┤ in-process
                                     └──────────────────────┘
                                              │
┌──────────────┐                     GET /api/agents/{name}/
│ Agent Detail │                     stats
│ Analytics    │                     ┌──────────────────────┐
│              │                     │ Agent Detail Page    │
│ Percentiles  │                     │ ┌──────────────────┐ │
│ History      │                     │ │Percentile Chart  │ │
│              │                     │ │Decomposition Card│ │ ← NEW
└──────────────┘                     │ │History Chart     │ │
                                     │ └──────────────────┘ │
                                     └──────────────────────┘
```

**Key Files** (11 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/channels/manager.py` | **MODIFIED** | ~+30 |
| `frontend/src/components/workspace/agents/timing-decomposition-card.tsx` | **NEW** | ~130 |
| `frontend/src/app/workspace/agents/[agent_name]/page.tsx` | **MODIFIED** | ~+20 |
| `frontend/src/core/agents/api.ts` | **REFACTORED** | ~-13/+2 |
| `frontend/src/core/agents/types.ts` | **MODIFIED** | +3 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +7 |
| `frontend/src/core/i18n/locales/en-US.ts` | **MODIFIED** | +7 |
| `frontend/src/core/i18n/locales/zh-CN.ts` | **MODIFIED** | +7 |
| `frontend/src/core/i18n/locales/ja-JP.ts` | **MODIFIED** | +7 |
| `frontend/src/core/i18n/locales/ko-KR.ts` | **MODIFIED** | +7 |
| `frontend/src/core/i18n/locales/de-DE.ts` | **MODIFIED** | +7 |
| `frontend/src/core/i18n/locales/fr-FR.ts` | **MODIFIED** | +7 |

**Technical Debt Resolved**:
- Channel service integration with instrument endpoint: **IMPLEMENTED** (both streaming and non-streaming paths instrumented, direct in-process TimingStore access)
- Frontend visualization of LangGraph vs Gateway timing: **IMPLEMENTED** (decomposition card with 3-row breakdown + proportional bar, data-driven, i18n-ready)
- Duplicate `AgentStats` interface in `api.ts`: **FIXED** (single source of truth in `types.ts`)

**New Technical Debt**:
- LangGraph timing includes streaming update throttling delays (0.35s min interval) — slightly inflates streaming timing
- No MCP tool-level latency tracking — timing is per-invocation, not per-tool-call
- Agent status detection queries checkpointer on each WebSocket push cycle — could be optimized with caching

**Remaining Candidates** (resolved in v0.39.0):
- Agent detail page "Delete" → batch mode unification for multi-agent deletion: **IMPLEMENTED** (v0.39.0)
- Marketplace API integration: **IMPLEMENTED** (v0.39.0)

---
### v0.39.0 - Batch Agent Deletion + Marketplace API Integration (2026-05-03)

**Goal**: Complete two pending features: batch agent deletion from gallery, and marketplace REST API integration (replacing Electron API dependency).

**Feature A — Batch Agent Deletion**:

Backend:
- `POST /api/agents/delete-batch` — accepts `{names: string[]}`, returns per-agent results with deleted/failed counts
- `BatchDeleteRequest`, `BatchDeleteItem`, `BatchDeleteResponse` Pydantic models
- `_cleanup_agent_threads()` helper called during batch deletion for each agent

Frontend:
- `deleteAgentsBatch()` in `api.ts` — POST to `/api/agents/delete-batch`
- `useDeleteAgentsBatch()` mutation hook with cache invalidation
- `BatchDeleteResponse` type re-exported from API layer

Gallery UI:
- "Delete Selected" button (`variant="destructive"`, `Trash2Icon`) in batch mode header
- Confirmation dialog (`Dialog` + `DialogFooter`) listing selected agent names
- Results toast: success for all-deleted, warning for partial failures, error for complete failure
- Clean up: exits batch mode + resets selection on success

i18n: 6 new keys × 7 locales (42 translations):
- `batchDelete`, `batchDeleteTitle`, `batchDeleteDescription`
- `batchDeleteSuccess`, `batchDeletePartial`, `batchDeleteFailed`

**Feature B — Marketplace API Integration**:

Backend (`backend/app/gateway/routers/marketplace.py`, NEW ~230 lines):
- `GET /api/marketplace/items` — aggregates real agents (from agent store) + mock plugins/skills/templates
- Query params: `type`, `category`, `search`, `sortBy` (popular/rated/recent/name)
- `GET /api/marketplace/stats` — totalItems, installedCount, per-type counts
- `GET /api/marketplace/categories` — unique category list
- Registered in `routers/__init__.py` and `app.py` via `include_router()`
- Pydantic models: `MarketplaceItem`, `MarketplaceItemsResponse`, `MarketplaceStats`
- Mock data: 5 plugins, 3 skills, 4 templates (all with ratings, downloads, permissions, hooks)
- Agents imported as marketplace items with `installStatus="installed"`, `source="local"`

Frontend core module (`frontend/src/core/marketplace/`, NEW):
- `types.ts` — `MarketplaceItem`, `MarketplaceStats`, `MarketplaceFilter`, etc.
- `api.ts` — `getMarketplaceItems()`, `getMarketplaceStats()`, `getMarketplaceCategories()` with URL query string encoding
- `hooks.ts` — `useMarketplaceItems()`, `useMarketplaceStats()`, `useMarketplaceCategories()` (React Query)
- `index.ts` — barrel exports

Marketplace page refactor:
- Replaced `@/core/electron-api/hooks` imports → `@/core/marketplace`
- Removed local `MarketplaceItem` interface (now from shared types)
- Removed `useEffect` for Electron install events
- Removed `window.electronAPI.marketplace` dependency
- `handleInstall`/`handleUninstall` → simulated with timeout (backend-driven install pending)
- Stats/categories computed from REST API response or localItems fallback
- Fixed `refreshItems` → `() => void refreshItems()` for React Query refetch type compatibility

```
Before (v0.38.0):                        After (v0.39.0):
┌──────────────────┐                     ┌──────────────────┐
│ Marketplace Page │                     │ Marketplace Page │
│  electron-api/   │                     │  core/marketplace│
│  hooks.ts  ──────┼─ window.electronAPI │  hooks.ts  ──────┼─ REST API
│  (broken in web) │                     │  (works in web)  │
└──────────────────┘                     └──────────────────┘
                                                  │
┌──────────────────┐                     ┌──────────────────┐
│ Agent Gallery    │                     │ Agent Gallery    │
│  Batch: Cancel   │                     │  Batch: Cancel   │
│          Export  │                     │       Delete Sel │ ← NEW
└──────────────────┘                     │          Export  │
                                         └──────────────────┘
                                                  │
                                         POST /api/agents/
                                         delete-batch
                                         ┌──────────────────┐
                                         │ Agent Store      │
                                         │ Cleanup threads  │
                                         │ Remove files     │
                                         └──────────────────┘
```

**Key Files** (14 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/agents.py` | **MODIFIED** | ~+40 |
| `backend/app/gateway/routers/marketplace.py` | **NEW** | ~230 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +1 |
| `backend/app/gateway/app.py` | **MODIFIED** | +3 |
| `frontend/src/core/agents/api.ts` | **MODIFIED** | ~+15 |
| `frontend/src/core/agents/hooks.ts` | **MODIFIED** | +12 |
| `frontend/src/core/marketplace/types.ts` | **NEW** | ~80 |
| `frontend/src/core/marketplace/api.ts` | **NEW** | ~40 |
| `frontend/src/core/marketplace/hooks.ts` | **NEW** | ~35 |
| `frontend/src/core/marketplace/index.ts` | **NEW** | ~15 |
| `frontend/src/components/workspace/agents/agent-gallery.tsx` | **MODIFIED** | ~+70 |
| `frontend/src/app/workspace/marketplace/page.tsx` | **REFACTORED** | ~-60/+30 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +6 |
| 6 locale files (`en-US/zh-CN/ja-JP/ko-KR/de-DE/fr-FR`) | **MODIFIED** | +6 each |

**Technical Debt Resolved**:
- Agent detail page "Delete" → batch mode unification: **IMPLEMENTED** (multi-agent deletion from gallery with confirmation dialog)
- Marketplace API integration: **IMPLEMENTED** (REST API backend + React Query hooks + page refactor, Electron dependency removed)

**New Technical Debt**:
- Install/uninstall in marketplace simulated (timeout-based) — needs real backend-driven package management
- Batch delete results display limited to toast — could add inline results panel like batch import
- Marketplace mock data hardcoded — could pull from a package registry or community contributions API

**Remaining Candidates** (resolved in v0.40.0):
- Dashboard Electron API migration: **IMPLEMENTED** (v0.40.0, REST API + React Query)
- Settings persistence: **IMPLEMENTED** (v0.40.0, localStorage replacing electronAPI)

---
### v0.40.0 - Dashboard REST API + Settings Persistence (2026-05-03)

**Goal**: Migrate the main Dashboard page from `window.electronAPI` polling to REST API + React Query. Fix Settings page offline persistence. This is Wave 1 of the 22-page Electron API migration.

**Dashboard Migration**:

Backend (`backend/app/gateway/routers/agents.py`, ~+130 lines):
- New Pydantic models: `HealthKPI`, `ResourceKPI`, `ServiceItem`, `AgentKPI`, `MemoryKPI`, `ToolKPI`, `DashboardStatsResponse`
- `GET /api/dashboard/stats` — single endpoint returning ALL dashboard KPI data:
  - Health (score, status, healthy/total services, critical issues) — from health subsystem
  - Resources (CPU%, memory%, disk%) — from psutil via health
  - Agents (totalAgents, totalChats, totalMessages, totalToolCalls, avgLatencyMs) — aggregated from agent store + timing store
  - Services (name, status, responseTimeMs) — from health checks
  - Memory (totalMemories, totalTopics) — from memory data
  - Tools (totalTools, availableTools) — from agent tool_groups aggregation
- All sub-collectors wrapped in try/except with graceful degradation

Frontend core module (`frontend/src/core/dashboard/`, ENHANCED):
- `types.ts` — Added `HealthKPI`, `ResourceKPI`, `ServiceItem`, `AgentKPI`, `MemoryKPI`, `ToolKPI`, `DashboardStats`
- `api.ts` — Added `getDashboardStats()`
- `hooks.ts` — Added `useDashboardStats()` with 30s `refetchInterval` auto-polling
- `index.ts` — NEW barrel export

Dashboard page (`frontend/src/app/workspace/dashboard/page.tsx`, REFACTORED ~479→351 lines):
- Removed: `useEffect` + `useState` + `setInterval` polling + `window.electronAPI.*` calls (~150 lines)
- Removed: Local `DashboardStats` interface (now from shared types)
- Refactored: `ServiceStatusList` — accepts `services` prop instead of internal `useEffect` + electronAPI
- Refactored: `ResourceUsageCard` — accepts `resources` prop instead of internal `useEffect` + electronAPI
- Simplified: Main component uses `const { data: stats, isLoading } = useDashboardStats()` — 1 line replaces 90+ lines
- KPI cards updated: Health Score → data-driven (not mock), "Active Sessions" replaced with "Agents" (real data), "Memories" and "Tools" also data-driven
- Quick Links updated: pointed to real pages (Agents, Marketplace, Performance)

```
Before (v0.39.0):                        After (v0.40.0):
┌──────────────────┐                     ┌──────────────────────┐
│ Dashboard Page   │                     │ Dashboard Page       │
│ ┌──────────────┐ │                     │ useDashboardStats()  │
│ │ useEffect()  │ │                     │   ↓ 30s auto-poll    │
│ │ 5× electron  │─┼─ window.electronAPI │   ↓ React Query      │
│ │ API calls    │ │                     │ Single hook → 6 KPIs │
│ │ setInterval  │ │                     └──────────────────────┘
│ │ 30s polling  │ │                              │
│ └──────────────┘ │                     ┌──────────────────────┐
│ ServiceStatusList│                     │ GET /dashboard/stats │
│  useEffect +    │─┼─ mock data         │ Health + Resources + │
│  electronAPI    │                     │ Agents + Services +   │
│ ResourceUsage   │                     │ Memory + Tools        │
│  useEffect +    │─┼─ mock data         └──────────────────────┘
│  electronAPI    │
└──────────────────┘
```

**Settings Persistence**:
- Replaced `window.electronAPI.app.setConfig("settings", ...)` → `localStorage.setItem("deerflow-settings", ...)` in auto-save `useEffect`
- Settings page already loaded from localStorage on mount; now both load AND save use localStorage
- Settings persist cross-session in any browser (not just Electron)

**Key Files** (5 total):

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/agents.py` | **MODIFIED** | ~+130 |
| `frontend/src/core/dashboard/types.ts` | **MODIFIED** | +50 |
| `frontend/src/core/dashboard/api.ts` | **MODIFIED** | +18 |
| `frontend/src/core/dashboard/hooks.ts` | **MODIFIED** | +16 |
| `frontend/src/core/dashboard/index.ts` | **NEW** | ~15 |
| `frontend/src/app/workspace/dashboard/page.tsx` | **REFACTORED** | ~-130/+100 |
| `frontend/src/app/workspace/settings/page.tsx` | **MODIFIED** | ~+5/-3 |

**Technical Debt Resolved**:
- Dashboard Electron API migration: **IMPLEMENTED** (full REST API + React Query, zero electronAPI calls, data-driven KPI cards)
- Settings persistence: **IMPLEMENTED** (localStorage replaces electronAPI for auto-save, settings survive browser restarts)

**New Technical Debt**:
- 20 remaining Electron-only pages (out of 22 original)
- `useDashboardStats()` doesn't surface `error` state to the dashboard page — errors are silently caught in the API layer
- Services list from health endpoint may not include all interesting services (depends on health check config)
- Settings page `useEffect` auto-save fires on every keystroke — could be debounced

**Remaining Candidates** (for next iteration):
1. MCP tool latency tracking (real MCP timing per tool call)
2. Next wave of Electron API migration (plugins, tools, memory pages)
3. Workflow builder UI (stretch goal, needs design first)
4. Real package install/uninstall backend for marketplace
5. Agent-to-marketplace publish flow (share agents as marketplace items)

---

### v0.41.0 - Performance Real Metrics + Agent Version Diff (2026-05-03)

**Problem**: Performance page had 2 of 4 metric categories using heuristic estimates. No way to compare two version snapshots side-by-side.

**Solution**: Fixed MCP and system performance metrics to use real TimingStore data. Added GET /agents/{name}/versions/diff endpoint with full front-end compare mode UI.

**Backend Changes**:

- **Performance router** (`backend/app/gateway/routers/performance.py`) — 2 fixes:
  - **MCP metrics**: Replaced heuristic (`all_timing_ms[:half] * 0.7`) with real LangGraph processing times via `timing.langgraph_history_as_list()`. MCP tools execute inside LangGraph, so LangGraph processing time is the closest available proxy.
  - **System metrics**: Replaced heuristic (`all_timing_ms * 0.08`) with real `TimingStore.overhead_avg_ms(name)` per agent (HTTP total − LangGraph processing). Graceful fallback to estimate when no overhead data exists.

- **Agent version diff endpoint** (`backend/app/gateway/routers/agents.py`) — NEW:
  - `AgentVersionDiffResponse` Pydantic model: `from_version`, `to_version` (both AgentVersionDetail), `config_diff` (key-level `{field: {from, to}}` dict), `soul_changed` (bool), `fields_changed` (list)
  - `GET /api/agents/{name}/versions/diff?from=V1&to=V2` — loads both version snapshots from disk, computes key-level config diff and SOUL comparison

**Frontend Changes**:

- **Core agents module** — 3 files modified:
  - `types.ts`: Added `AgentVersionDiffResponse` interface
  - `api.ts`: Added `diffAgentVersions(name, fromVersion, toVersion)` with URLSearchParams
  - `hooks.ts`: Added `useAgentVersionDiff(name, fromV, toV)` hook (enabled only when dialog open and 2 versions selected)
  - `index.ts`: Added type export

- **Agent detail page** (`[agent_name]/page.tsx`) — MODIFIED (~+155 lines):
  - **VersionHistoryItem** enhanced: Compare mode with circular selection indicators; click toggles selection instead of expanding
  - **Version history CardHeader**: "Compare" toggle button + "Compare (N/2)" action button
  - **VersionDiffDialog**: New Dialog with changed-fields badges, side-by-side config comparison (orange/green highlights), SOUL comparison panels with modified indicator, skeleton loading, identical-versions state

**File Changes Summary**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/performance.py` | **MODIFIED** | ~+30/-10 |
| `backend/app/gateway/routers/agents.py` | **MODIFIED** | ~+85 |
| `frontend/src/core/agents/types.ts` | **MODIFIED** | +7 |
| `frontend/src/core/agents/api.ts` | **MODIFIED** | +16 |
| `frontend/src/core/agents/hooks.ts` | **MODIFIED** | +14 |
| `frontend/src/core/agents/index.ts` | **MODIFIED** | +1 |
| `frontend/src/app/workspace/agents/[agent_name]/page.tsx` | **MODIFIED** | ~+155 |

**Technical Debt Resolved**:
- Performance MCP heuristic estimates: **REPLACED** with real LangGraph processing times
- Performance system heuristic estimates: **REPLACED** with real Gateway overhead per agent
- Agent version side-by-side comparison: **IMPLEMENTED** (backend + frontend)

**New Technical Debt**:
- MCP timing still uses LangGraph processing as proxy — true per-MCP-tool timing requires cross-process instrumentation
- Version diff dialog uses hardcoded English labels (no i18n keys for compare UI)
- Version selection direction not clearly indicated in UI (selected[0]=from, selected[1]=to)

**Remaining Candidates** (for next iteration):
1. True per-MCP-tool call timing instrumentation
2. Next wave of Electron API migration (plugins, tools, memory pages — 20 remaining)
3. Workflow builder UI (stretch goal)
4. Real marketplace install/uninstall backend
5. Agent-to-marketplace publish flow
6. i18n coverage for new compare UI

---

### v0.42.0 - RAG Document Knowledge Base (2026-05-03)

**Problem**: The platform had Knowledge Graph (entity-relation) and Memory (conversation facts), but no document-based RAG pipeline. Users couldn't upload documents and semantically search across them.

**Solution**: Built a complete RAG document knowledge base from scratch — backend ingestion + chunking + TF-IDF search + JSON persistence, with frontend management page and sidebar navigation.

**Backend Changes**:

- **Knowledge Base router** (`backend/app/gateway/routers/knowledge_base.py`) — **NEW** (~480 lines):
  - Document ingestion: multipart upload via `POST /api/electron/kb/documents`
  - Text extraction: direct read for TXT/MD/JSON/code files; PyPDF2 for PDF; python-docx for DOCX (with graceful fallback)
  - Smart chunking: paragraph-aware splitting with configurable size (600 chars) and overlap (100 chars)
  - TF-IDF vectorization: scikit-learn `TfidfVectorizer` with ngram_range=(1,2), max_features=10000
  - Semantic search: `POST /api/electron/kb/search` with cosine similarity, configurable topK and minScore
  - JSON persistence: `knowledge_base.json` auto-saved on every mutation, auto-loaded on startup
  - Document file storage: `knowledge_docs/` directory with UUID-named files
  - Auto-entity extraction: lightweight key-term extraction feeds Knowledge Graph (non-blocking background task)
  - Stats endpoint: `GET /api/electron/kb/stats` returns total docs/chunks/chars/file types/indexed vectors
  - Reindex endpoint: `POST /api/electron/kb/reindex` force-rebuilds TF-IDF vectors
  - Document CRUD: list/get/delete with full metadata and chunks

- **Router registration** (`backend/app/gateway/routers/__init__.py`) — **MODIFIED**: Added `knowledge_base` import and `__all__` entry

- **Gateway app** (`backend/app/gateway/app.py`) — **MODIFIED** (~+25 lines):
  - Added `knowledge_base` import
  - Added `_restore_kb_state()` / `_persist_kb_state()` lifecycle hooks
  - Added `app.include_router(knowledge_base.router)` mounted at `/api/electron/kb`
  - Integrated into startup/shutdown lifespan

**Frontend Changes**:

- **Core knowledge-base module** (`frontend/src/core/knowledge-base/`) — **NEW** (4 files):
  - `types.ts`: DocumentMeta, DocumentDetail, SearchRequest, SearchResult, KBStats interfaces
  - `api.ts`: uploadDocument, listDocuments, getDocument, deleteDocument, searchKnowledgeBase, getKBStats, reindexKnowledgeBase
  - `hooks.ts`: React Query hooks — useKBStats, useKBDocuments, useKBDocument, useUploadDocument, useDeleteDocument, useSearchKB, useReindexKB
  - `index.ts`: Barrel exports

- **Knowledge Base page** (`frontend/src/app/workspace/knowledge-base/page.tsx`) — **NEW** (~410 lines):
  - 5-column stats dashboard (Documents, Chunks, Total Chars, Avg Chunk, File Types)
  - Document upload tab: drag-and-drop with file type icons, size display, title override
  - Document list tab: search/filter, expandable chunk preview, file type badges, delete action
  - Semantic search tab: TF-IDF query with result scoring, preview display, query time ms
  - Reindex button for rebuilding TF-IDF vectors
  - Responsive design with skeleton loading states and empty states

- **Sidebar navigation** (`workspace-nav-chat-list.tsx`) — **MODIFIED**:
  - Added BookOpenIcon import from lucide-react
  - Added Knowledge Base nav item (icon + i18n label) after Knowledge Graph

- **i18n translations** — **MODIFIED** (6 locale files + types):
  - `en-US.ts`: "Knowledge Base"
  - `zh-CN.ts`: "文档知识库"
  - `ja-JP.ts`: "ナレッジベース"
  - `de-DE.ts`: "Wissensbasis"
  - `ko-KR.ts`: "지식 베이스"
  - `fr-FR.ts`: "Base de connaissances"
  - `types.ts`: Added `knowledgeBase: string` to sidebar type

**File Changes Summary**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/knowledge_base.py` | **NEW** | ~480 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +2 |
| `backend/app/gateway/app.py` | **MODIFIED** | ~+25 |
| `frontend/src/core/knowledge-base/types.ts` | **NEW** | 57 |
| `frontend/src/core/knowledge-base/api.ts` | **NEW** | 95 |
| `frontend/src/core/knowledge-base/hooks.ts` | **NEW** | 76 |
| `frontend/src/core/knowledge-base/index.ts` | **NEW** | 10 |
| `frontend/src/app/workspace/knowledge-base/page.tsx` | **NEW** | ~410 |
| `frontend/src/components/workspace/workspace-nav-chat-list.tsx` | **MODIFIED** | +11 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +1 |
| `frontend/src/core/i18n/locales/*.ts` (6 files) | **MODIFIED** | +6 |

**Architecture Decisions**:
- **TF-IDF over embeddings**: Chose scikit-learn TF-IDF because it requires no external API keys, works offline, and is sufficient for document-level semantic search. Embeddings (via LLM APIs) can be added later as an upgrade path.
- **JSON persistence over SQLite**: Follows existing Knowledge Graph pattern — single `knowledge_base.json` file for metadata/chunks, `knowledge_docs/` for raw files.
- **Auto-linking to Knowledge Graph**: Document ingestion optionally extracts key terms and creates entities as a background task, providing a bridge between document search and structured graph.
- **Paragraph-aware chunking**: Splits on paragraph boundaries first, then on sentence breaks for oversized paragraphs, preserving semantic coherence.

**Technical Debt Introduced**:
- PDF text extraction requires PyPDF2 (soft dependency — graceful fallback to placeholder text)
- DOCX text extraction requires python-docx (soft dependency — graceful fallback)
- Knowledge Graph auto-linking is one-way (kb → kg) — no entity-to-document backlinks yet
- Chunk preview in document list requires a separate API call (lazy-loaded on expand)
- Search uses in-memory TF-IDF — no persistent index file (rebuilds on startup)
- No embedding model integration (LLM-based semantic search not yet implemented)

**Remaining Candidates** (for next iteration):
1. Embedding model integration (OpenAI/Anthropic embeddings) for true semantic search
2. PDF/DOCX dependency auto-install UX
3. Knowledge Graph ↔ Knowledge Base bi-directional linking
4. Batch document import (folder upload, ZIP extraction)
5. Document tags/categories and advanced filtering
6. i18n coverage for knowledge base page UI strings
7. Next wave of Electron API migration (plugins, tools, memory pages)

---
## Last Updated
2026-05-03 17:31 CST (v0.43.0)


### v0.43.0 - KB Embedding-powered Hybrid Semantic Search (2026-05-03)

**Problem**: The v0.42.0 Knowledge Base used only TF-IDF for semantic search, which captures lexical similarity but misses true semantic meaning. Queries like "machine learning techniques" wouldn't find documents about "neural network training" despite semantic relevance.

**Solution**: Added embedding-powered hybrid search that fuses TF-IDF (lexical) with LLM embeddings (semantic) for dramatically better search quality. Auto-detects OpenAI API keys — no new configuration needed.

**Backend Changes**:

- **Embedding provider** (`backend/app/gateway/routers/embeddings.py`) — **NEW** (~168 lines):
  - `EmbeddingProvider` abstract base (async `.embed()` + `.is_available()` + `.status_dict()`)
  - `OpenAIEmbeddingProvider` — wraps `openai.AsyncOpenAI` client, uses `text-embedding-3-small` (1536d), batches up to 20 chunks per API call
  - Auto-detection: checks `OPENAI_API_KEY` env var, then scans `config.yaml` models for any OpenAI provider's api_key
  - Extensible architecture: future providers (Anthropic/Voyage, local models) plug in via same interface
  - `encode_vectors()` / `decode_vectors()` — efficient float32 base64 serialization for JSON storage
  - `compute_similarity()` — cosine similarity with numpy normalization
  - `get_embedding_status()` / `init_embedding_provider()` — singleton lifecycle managed by gateway startup

- **Knowledge Base router** (`backend/app/gateway/routers/knowledge_base.py`) — **MODIFIED** (~+215 lines):
  - **Hybrid search endpoint**: `POST /api/search/hybrid` — weighted fusion `hybrid_score = α × norm_emb + (1-α) × norm_tfidf`
  - **Embedding status endpoint**: `GET /api/embeddings/status` — provider/model/dimension/available/embedded_chunks
  - **Document ingestion enhancement**: `_compute_embeddings_for_doc()` — computes embeddings outside the lock (API calls), persists via NPY binary file
  - **Vector storage**: `knowledge_base_vectors.npy` alongside `knowledge_base.json` — float32 numpy binary, ~3KB per 1536d vector (vs ~15KB JSON); auto-loads on startup, aligns with chunk_index
  - **Score-aware search**: `_hybrid_search()` — computes TF-IDF + embedding scores independently, fuses with alpha weighting, returns per-component scores for UI display
  - **Graceful fallback**: When no embedding provider available, falls back to TF-IDF only (identical behavior to v0.42.0)
  - 4 new Pydantic models: `HybridSearchRequest`, `HybridSearchResult`, `HybridSearchResponse`, `EmbeddingStatusResponse`

- **Gateway lifecycle** (`backend/app/gateway/app.py`) — **MODIFIED** (~+6 lines):
  - `_restore_kb_state()` now calls `init_embedding_provider()` after loading KB state

**Frontend Changes**:

- **Core knowledge-base module** — 4 files modified:
  - `types.ts` (+45 lines): `HybridSearchRequest`, `HybridSearchResult`, `HybridSearchResponse`, `EmbeddingStatus` interfaces
  - `api.ts` (+20 lines): `hybridSearchKnowledgeBase()`, `getEmbeddingStatus()` API functions
  - `hooks.ts` (+16 lines): `useHybridSearchKB()` mutation, `useEmbeddingStatus()` query (60s refetch)
  - `index.ts` (+4 exports): New types + hooks exposed

- **Knowledge Base page** (`page.tsx`) — **MODIFIED** (~+180 lines):
  - **EmbeddingStatusBanner** — 3 states: green "Active" (provider/model/dim/chunks shown), amber "No provider" (with OPENAI_API_KEY hint), loading spinner
  - **HybridSearchPanel** — replaces old SearchPanel:
    - 3-mode segmented toggle: TF-IDF / Hybrid / AI (Embeddings), adaptive disabled state when no provider
    - **Alpha slider**: gradient range input (slate→amber→violet) controlling TF-IDF vs embedding weight (0.0–1.0), real-time percentage display
    - **Score breakdown**: dual mini-bars per result showing TF-IDF (slate) and Embedding (violet) components with numerical labels (T:XX / A:XX)
    - "AI-Powered" badge on header when embeddings active + SparklesIcon
    - Search description adapts to provider status: shows provider/model name
    - Responsive: score bars hidden on mobile (`hidden sm:flex`)

**File Changes Summary**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/embeddings.py` | **NEW** | ~168 |
| `backend/app/gateway/routers/knowledge_base.py` | **MODIFIED** | ~+215 |
| `backend/app/gateway/app.py` | **MODIFIED** | +6 |
| `frontend/src/core/knowledge-base/types.ts` | **MODIFIED** | +45 |
| `frontend/src/core/knowledge-base/api.ts` | **MODIFIED** | +20 |
| `frontend/src/core/knowledge-base/hooks.ts` | **MODIFIED** | +16 |
| `frontend/src/core/knowledge-base/index.ts` | **MODIFIED** | +4 |
| `frontend/src/app/workspace/knowledge-base/page.tsx` | **MODIFIED** | ~+180 |
| **Total** | | **~654 lines** |

**Architecture Decisions**:
- **NPY binary for vectors**: Separate `.npy` file instead of embedding vectors in JSON. 3KB per vector (float32 binary) vs ~15KB (JSON float array). NumPy's `np.save()/np.load()` is fast and reliable.
- **Out-of-lock embedding computation**: Embeddings are computed after releasing the lock (API calls can take seconds), then index is rebuilt inside the lock with the new vectors
- **Provider auto-detection**: No new config needed. Checks `OPENAI_API_KEY` env var → scans `config.yaml` models for OpenAI entries → falls back gracefully
- **Alpha-weighted fusion**: Same architecture as Yuxi v0.47.0 hybrid search — independent score dimensions fused with weighted combination, per-component scores visible in UI

**Technical Debt Resolved**:
- v0.42.0 #1 remaining candidate: **Embedding model integration** — IMPLEMENTED
- TF-IDF-only search limitation — **UPGRADED** to hybrid with OpenAI embeddings

**New Technical Debt**:
- Embedding computation is synchronous-on-ingestion: uploaded doc chunks are embedded sequentially; could be parallelized for large docs
- Vector alignment validation depends on chunk_index ordering consistency — fragile if chunks are reorganised
- No embedding re-computation on document update (if document editing is added later)
- `_search_chunks` called internally with `top_k * 5` to inflate TF-IDF candidate pool for hybrid fusion — may miss chunks below TF-IDF threshold but high in embedding similarity

**Remaining Candidates** (for next iteration):
1. Knowledge Graph ↔ Knowledge Base bi-directional linking (entity pages show related docs)
2. Document tags/categories and advanced filtering
3. PDF/DOCX dependency auto-install UX
4. Batch document import (folder upload, ZIP extraction)
5. i18n coverage for knowledge base page UI strings
6. Anthropic/Voyage embedding provider support
7. Next wave of Electron API migration (plugins, tools, memory pages)
8. Agent-to-marketplace publish flow

---
### v0.44.0 - KB Document Tags, Categories, Advanced Filtering & Full i18n (2026-05-03)

**Problem**: The v0.43.0 Knowledge Base lacked document organization — all documents were undifferentiated in a flat list. Hardcoded English UI strings prevented non-English users from fully using the KB. There was no way to categorize, tag, filter, or update document metadata after upload.

**Solution**: Added tags/categories to document metadata, a PATCH endpoint for metadata editing, category/tag-based filtering in the document list, tag quick-filter chips, a full Edit Document dialog, and complete i18n coverage (6 languages) for all KB page UI strings.

**Backend Changes**:

- **Document metadata model** (`knowledge_base.py`) — **MODIFIED** (~+80 lines):
  - `DocumentMeta` Pydantic model: added `tags: list[str]` (default `[]`) and `category: str` (default `"general"`)
  - `DocumentUpdateRequest` model: partial-update fields (title, tags, category)
  - `TagsResponse` model: aggregated tag/category lists with counts
  - `KBStatsResponse`: added `categories` and `tags` count maps

- **Upload endpoint** (`POST /documents`):
  - New query params: `category` (default "general"), `tags` (comma-separated string)
  - `_infer_category(ext)` helper: auto-categorizes by extension (.py→code, .md→documentation, .csv→data, .pdf→research, etc.)
  - Tags stored as lowercase trimmed list in document dict

- **New endpoints** — 2 new:
  - `PATCH /api/electron/kb/documents/{id}` — updates title, tags, category under async lock, returns updated DocumentMeta
  - `GET /api/electron/kb/tags` — aggregates all tags and categories with per-tag/category document counts

- **Enhanced filtering** — `list_documents` now accepts `category` and `tag` query params:
  - Category filter matches exact category name
  - Tag filter checks if tag exists in doc's tags array
  - Search also considers tag text (haystack expansion)

- **Stats endpoint** — now returns `categories` and `tags` count maps alongside existing fileType counts

**Frontend Changes**:

- **Core knowledge-base module** — 4 files modified:
  - `types.ts` (+25 lines): added `tags: string[]`, `category: string` to `DocumentMeta`; new `DocumentUpdateRequest`, `TagItem`, `TagsResponse` types; `KBStats` extended with `categories`/`tags`
  - `api.ts` (+25 lines): `updateDocumentMetadata()`, `listTags()`; `uploadDocument()` accepts `tags?`/`category?` params; `listDocuments()` accepts `category?`/`tag?` filter params
  - `hooks.ts` (+30 lines): `useUpdateDocumentMetadata()` mutation, `useTags()` query (60s refetch); `useKBDocuments()` extended with category/tag filter args; upload/delete mutations invalidate tags cache
  - `index.ts` (+3 lines): new types and hooks exposed

- **Knowledge Base page** (`page.tsx`) — **COMPLETE REWRITE** (1086 lines, was 783):
  - **Full i18n integration**: `useI18n()` hook → all 100+ hardcoded UI strings replaced with `t.knowledgeBase.*` calls (pageTitle, upload, search, documents, stats, categories, tags, embedding, edit namespaces)
  - **Upload form enhanced**: category Select dropdown (general/code/documentation/data/research/other), tags input field (comma-separated), sends both to backend on upload
  - **Category filter**: Select dropdown in documents header filters by category; resets tag filter on category change
  - **Tag quick-filter bar**: below documents header, shows top 12 tags as clickable chips with counts; "All Tags" default; active tag shows clearable badge
  - **Tag badges on document rows**: up to 3 inline tag badges per document (with "+N" overflow indicator); category badge with color coding (blue=code, green=documentation, amber=data, purple=research)
  - **Edit Document Dialog**: pencil icon button per document row → `Dialog` with title input, category Select, tags input; save calls `useUpdateDocumentMetadata()`; shows animated checkmark on save; refetches document list on close
  - **Stats panel expanded**: 7 cards (was 5) — added Categories and Tags count cards; auto-skeleton loading
  - **All existing features preserved**: search panel (TF-IDF/Hybrid/AI toggle), embedding status banner, chunk expansion, upload drag-drop, reindex button

- **i18n locales** — 6 files modified + 1 type def:
  - `types.ts` (+62 lines): `knowledgeBase` namespace with 56 keys (pageTitle, reindex, upload.*, search.*, documents.*, stats.*, categories.*, tags.*, embedding.*, edit.*)
  - `en-US.ts`, `zh-CN.ts`, `ja-JP.ts`, `ko-KR.ts`, `de-DE.ts`, `fr-FR.ts` — full translations for all 56 keys in each language (336 new translation lines)

**Category System**:
- 7 predefined categories: general, code, documentation, data, research, other
- Color-coded badges for visual distinction
- Auto-inferred on upload from file extension (can be overridden)
- Filterable in document list, editable in dialog
- Counted in stats panel

**File Changes Summary**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/knowledge_base.py` | **MODIFIED** | ~+80 |
| `frontend/src/core/knowledge-base/types.ts` | **MODIFIED** | +25 |
| `frontend/src/core/knowledge-base/api.ts` | **MODIFIED** | +25 |
| `frontend/src/core/knowledge-base/hooks.ts` | **MODIFIED** | +30 |
| `frontend/src/core/knowledge-base/index.ts` | **MODIFIED** | +3 |
| `frontend/src/app/workspace/knowledge-base/page.tsx` | **REWRITTEN** | 1086 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +62 |
| `frontend/src/core/i18n/locales/en-US.ts` | **MODIFIED** | +56 |
| `frontend/src/core/i18n/locales/zh-CN.ts` | **MODIFIED** | +56 |
| `frontend/src/core/i18n/locales/ja-JP.ts` | **MODIFIED** | +56 |
| `frontend/src/core/i18n/locales/ko-KR.ts` | **MODIFIED** | +56 |
| `frontend/src/core/i18n/locales/de-DE.ts` | **MODIFIED** | +56 |
| `frontend/src/core/i18n/locales/fr-FR.ts` | **MODIFIED** | +56 |
| **Total** | | **~1,672 lines** |

**Technical Debt Resolved**:
- v0.43.0 #2 remaining candidate: **Document tags/categories and advanced filtering** — IMPLEMENTED
- v0.43.0 #5 remaining candidate: **i18n coverage for knowledge base page UI strings** — IMPLEMENTED
- v0.42.0 #5: Document edit capability — IMPLEMENTED (PATCH endpoint + Edit dialog)

**New Technical Debt**:
- Category names in CATEGORY_LABELS/CATEGORY_COLORS are hardcoded on frontend (not from i18n) — would need localization if English-only category names become a problem
- Tag input uses comma-separated text (no autocomplete from existing tags)
- Existing docs uploaded in v0.42/0.43 have no tags/category — appear as "general" with empty tags (UPGRADE NOTE)

**Remaining Candidates** (for next iteration):
1. PDF/DOCX dependency auto-install UX
2. Batch document import (folder upload, ZIP extraction)
3. Document-to-Knowledge-Graph bi-directional linking
4. Anthropic/Voyage embedding provider support
5. Embedding parallelization for large documents (current: sequential chunk embedding)
6. Agent-to-marketplace publish flow
7. Next wave of Electron API migration (plugins, tools, memory pages)

---
## Last Updated
2026-05-03 17:58 CST (v0.44.0)

---

### v0.45.0 — Document Content Viewer, Download & Batch Operations (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Document Download Endpoint** — `GET /api/electron/kb/documents/{id}/download`:
- Returns the original uploaded file with correct `Content-Disposition` and MIME type
- MIME type map for 16 file extensions (text/plain, text/markdown, application/pdf, etc.)
- Fallback file lookup: tries stored extension first, then scans all supported extensions
- 404 if document not found in index or file missing from disk
- Uses FastAPI `FileResponse` for efficient streaming

**B. Batch Delete Endpoint** — `POST /api/electron/kb/documents/batch-delete`:
- Accepts `{ ids: [...] }` with min 1 ID required
- Processes all deletes within single lock acquisition — atomic state mutation
- Single index rebuild + single persistence after all deletes (O(N) instead of O(N×R))
- Returns `BatchDeleteResponse`: success boolean, deleted count, failed count, errors array
- New Pydantic models: `BatchDeleteRequest`, `BatchDeleteResponse`

**C. Frontend Core Module Updates** — 3 files modified:
- `types.ts` (+14 lines): `BatchDeleteRequest`, `BatchDeleteResponse` interfaces
- `api.ts` (+35 lines): `getDocumentDownloadUrl(docId)`, `downloadDocument(docId, filename)`, `batchDeleteDocuments(req)` with Blob download + `<a>` click technique
- `hooks.ts` (+14 lines): `useBatchDeleteDocuments()` React Query mutation with full cache invalidation (documents + stats + tags)
- `index.ts`: barrel export updated for new types

**D. Document Content Viewer** — `frontend/src/app/workspace/knowledge-base/document-viewer-dialog.tsx` **NEW** (~190 lines):
- Full-screen modal showing all document chunks as continuous scrollable content
- Chunk navigation tabs (click to jump, active highlight with `border-primary/50 bg-primary/5`)
- Document metadata header: file type badge, category badge (color-coded), tag badges, stats (chunks · chars · file size)
- Copy full text button (clipboard API, "Copied!" confirmation with 2s reset)
- Download button (triggers file download from backend endpoint)
- ScrollArea with 60vh height for large documents
- Loading spinner while fetching chunks, empty state with icon
- Lazy loading: fetches document chunks on first open, cached in state

**E. Batch Operations UI** — Document list in `page.tsx` (~+100 lines):
- **Batch toggle button**: "Batch Select" (outlined, CheckSquareIcon) appears above document list when not in batch mode
- **Batch mode header**: Collapsible bar with:
  - Select All / Deselect All toggle (CheckSquareIcon/SquareIcon)
  - Selection counter: "{N} selected"
  - "Delete {count} selected" destructive button (with pending spinner)
  - "Cancel" button to exit batch mode
- **Per-row checkboxes**: CheckSquareIcon/SquareIcon toggle visible only in batch mode, click toggles selection highlighting (`border-primary bg-primary/5`)
- **Batch delete flow**: confirm → mutateAsync → clear selection → exit batch mode → refetch list

**F. Document Row Enhancements** — `DocumentRow` (~+15 lines):
- **View button** (EyeIcon): opens DocumentViewerDialog for full document reading
- **Download button** (DownloadIcon): triggers file download via `getDocumentDownloadUrl()`
- Action bar now: View → Download → Chunks → Edit → Delete (5 buttons in logical order)

**G. i18n Coverage** — 5 new keys across 7 files (types + 6 languages):
- `documents.batchSelect`, `documents.cancel`, `documents.selectAll`, `documents.selected`, `documents.batchDelete`
- All 6 languages: en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR
- `batchDelete` key supports `{count}` interpolation for dynamic button labels

**Architecture**:
```
Document Download:
  DocumentRow ──[Download btn]──► GET .../documents/{id}/download
    └── FileResponse ──► blob ──► <a download> ──► user's downloads folder

Batch Delete:
  DocumentList ──[Batch Select]──► Checkbox mode toggle
    └── [Select rows] ──► POST .../documents/batch-delete {ids:[...]}
         └── Lock → delete all → rebuild index → persist → {deleted, failed, errors}

Document Content Viewer:
  DocumentRow ──[View btn]──► DocumentViewerDialog
    └── GET .../documents/{id} ──► chunks[]
         └── Chunk tabs + ScrollArea + Copy/Download
```

**File Changes**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/knowledge_base.py` | **MODIFIED** | +100 |
| `frontend/src/core/knowledge-base/types.ts` | **MODIFIED** | +14 |
| `frontend/src/core/knowledge-base/api.ts` | **MODIFIED** | +35 |
| `frontend/src/core/knowledge-base/hooks.ts` | **MODIFIED** | +14 |
| `frontend/src/core/knowledge-base/index.ts` | **MODIFIED** | +2 |
| `frontend/src/app/workspace/knowledge-base/document-viewer-dialog.tsx` | **NEW** | ~190 |
| `frontend/src/app/workspace/knowledge-base/page.tsx` | **MODIFIED** | ~+130 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +5 |
| `frontend/src/core/i18n/locales/*.ts` (6 files) | **MODIFIED** | +30 total |
| **Total** | | **~530 lines** |

**Technical Debt Resolved**:
- No document content reading beyond chunk previews: **RESOLVED** (DocumentViewerDialog)
- No file download from KB: **RESOLVED** (GET download endpoint + per-row button)
- No batch document operations: **RESOLVED** (batch delete with multi-select UI)

**New Technical Debt**:
- Document viewer lacks in-document text search (Ctrl+F style highlight)
- Batch operations currently only support delete (no batch tag/category assignment)
- Download uses Blob technique — very large files (>100MB) would benefit from direct link approach
- Category name i18n still hardcoded in component constants

**Remaining Candidates** (for next iteration):
1. In-document text search within DocumentViewerDialog
2. Batch tag/category assignment (apply to multiple docs at once)
3. PDF/DOCX dependency auto-install UX
4. Batch document import (folder upload, ZIP extraction)
5. Document-to-Knowledge-Graph bi-directional link viewing
6. Document reindex for specific doc (re-extract text + re-chunk)
7. Next wave of Electron API migration (plugins, tools, memory pages)

---

### v0.46.0 — Cross-Module Integration & Data Pipeline (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Backup REST API** — `backend/app/gateway/routers/backup.py` **NEW** (~250 lines):
- 6 endpoints: `GET /config`, `PUT /config`, `POST /create`, `GET /list`, `DELETE /{id}`, `GET /stats`
- JSON-file persistence (`backups.json`) with async lock and lifecycle hooks in `app.py`
- Pydantic models: `BackupConfigModel`, `BackupConfigUpdateRequest`, `CreateBackupRequest`, `BackupStatsResponse`
- Config supports: enabled toggle, interval hours, max backups cap, backup path, 7 component toggles (sessions/workflows/kg/config/memories/plugins), compress flag
- Auto-enforces max backup limit when creating new entries

**B. Backup Frontend Core Module** — `core/backup/` **NEW** (~150 lines, 4 files):
- `types.ts`: `BackupEntry`, `BackupConfig`, `BackupStats`, `CreateBackupRequest` interfaces
- `api.ts`: 6 API functions with `fetchJson`/`fetchJsonSafe` (`/api/electron/backup` base)
- `hooks.ts`: 6 React Query hooks (`useBackupConfig`, `useUpdateBackupConfig`, `useBackups`, `useCreateBackup`, `useDeleteBackup`, `useBackupStats`)
- `index.ts`: barrel export
- Backup page rewired: removed 127 lines of MOCK_BACKUPS/DEFAULT_CONFIG/local types, uses React Query hooks with `effectiveConfig`/`effectiveStats` fallback pattern

**C. Knowledge Graph ↔ Knowledge Base Bi-directional Linking**:
- **Backend** — 2 new endpoints:
  - `GET /api/electron/kg/entities/by-doc/{doc_id}` — returns all KG entities with `properties.sourceDocId === doc_id`
  - `GET /api/electron/kb/documents/{doc_id}/related-entities` — cross-module query into KG entities, same filter
- **Frontend core** — 4 files updated:
  - `knowledge-base/types.ts`: `RelatedEntity` interface (id, name, type, source, confidence)
  - `knowledge-base/api.ts`: `getDocumentRelatedEntities(docId)` function
  - `knowledge-base/hooks.ts`: `useDocumentRelatedEntities(docId)` React Query hook
  - `knowledge-graph/api.ts`: `getEntitiesByDocument(docId)` function
  - `knowledge-graph/hooks.ts`: `useEntitiesByDocument(docId)` React Query hook
- **UI panels**:
  - KB page DocumentRow: "Related KG Entities" expandable section (toggle button with NetworkIcon, entity badges with confidence percentage, auto-fetches on expand)
  - KG page entity detail panel: "Source Documents" badge row (FileTextIcon, doc title) when `properties?.sourceDocId` exists

**D. Document Content Viewer In-Text Search** — `document-viewer-dialog.tsx` (~+100 lines):
- **Ctrl+F** keyboard shortcut to toggle search bar (useEffect keydown listener)
- Search input with prev/next match navigation buttons (ChevronLeft/ChevronRight, Enter/Shift+Enter)
- "N of M matches" counter display
- `performSearch(query)`: iterates all chunks, finds all case-insensitive match indices
- `navigateMatch(direction)`: wraps around result list, auto-scrolls chunk into view
- `highlightMatches(text, query, activeMatchIndex?)`: splits text around matches, wraps in `<mark>` with color (active=amber bg, inactive=yellow/50 bg)
- Search bar positioned between metadata header and chunk navigation tabs

**E. i18n Coverage** — 7 files updated (~+210 lines):
- `types.ts`: `backup` namespace (27 keys) + `knowledgeBase.documents.relatedEntities`
- All 6 languages: **en-US**, **zh-CN**, **ja-JP**, **ko-KR**, **de-DE**, **fr-FR**
- Backup translations cover: title, subtitle, stats labels, config labels, component descriptions, actions, restore dialog, merge strategy options

**Architecture**:
```
Backup Data Flow:
  BackupPage ──[React Query]──► core/backup/api ──fetchJson──► /api/electron/backup/*
    └── hooks: useBackupConfig/useBackups/useBackupStats/...
         └── mutations: useCreateBackup/useDeleteBackup/useUpdateBackupConfig
              └── onSuccess → queryClient.invalidateQueries

KG↔KB Linking:
  KB Document → GET /kb/documents/{id}/related-entities
    └── Cross-module: reads KG _entities dict, filters by properties.sourceDocId
  KG Entity   → GET /kg/entities/by-doc/{id}
    └── Same filter, returns entities created during document upload

Document In-Text Search:
  Ctrl+F → show search bar → type query → performSearch()
    └── chunk[i].text.toLowerCase().indexOf(query)
    └── matchResults[] = {chunkIndex, matchIndex}
         └── navigateMatch() → active ± 1 (wrap)
              └── highlightMatches() → <mark className="bg-amber-500/30"> (active) / "bg-yellow-500/20" (inactive)
                   └── scrollTo chunk container
```

**File Changes**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/backup.py` | **NEW** | ~250 |
| `backend/app/gateway/routers/__init__.py` | **MODIFIED** | +2 |
| `backend/app/gateway/app.py` | **MODIFIED** | +20 |
| `backend/app/gateway/routers/knowledge_graph.py` | **MODIFIED** | +12 |
| `backend/app/gateway/routers/knowledge_base.py` | **MODIFIED** | +20 |
| `frontend/src/core/backup/types.ts` | **NEW** | ~45 |
| `frontend/src/core/backup/api.ts` | **NEW** | ~60 |
| `frontend/src/core/backup/hooks.ts` | **NEW** | ~40 |
| `frontend/src/core/backup/index.ts` | **NEW** | ~5 |
| `frontend/src/core/knowledge-base/types.ts` | **MODIFIED** | +5 |
| `frontend/src/core/knowledge-base/api.ts` | **MODIFIED** | +10 |
| `frontend/src/core/knowledge-base/hooks.ts` | **MODIFIED** | +10 |
| `frontend/src/core/knowledge-base/index.ts` | **MODIFIED** | +2 |
| `frontend/src/core/knowledge-graph/api.ts` | **MODIFIED** | +15 |
| `frontend/src/core/knowledge-graph/hooks.ts` | **MODIFIED** | +10 |
| `frontend/src/app/workspace/backup/page.tsx` | **MODIFIED** | -127 +50 |
| `frontend/src/app/workspace/knowledge-base/page.tsx` | **MODIFIED** | +40 |
| `frontend/src/app/workspace/knowledge-graph/page.tsx` | **MODIFIED** | +15 |
| `frontend/src/app/workspace/knowledge-base/document-viewer-dialog.tsx` | **MODIFIED** | +100 |
| `frontend/src/core/i18n/locales/types.ts` | **MODIFIED** | +30 |
| `frontend/src/core/i18n/locales/*.ts` (6 files) | **MODIFIED** | +180 total |
| **Total** | | **~900 lines** |

**Technical Debt Resolved**:
- Backup page used 100% mock data: **RESOLVED** (full REST API + React Query hooks)
- Knowledge Graph and Knowledge Base isolated: **RESOLVED** (bi-directional linking)
- Document viewer lacked in-text search: **RESOLVED** (Ctrl+F with highlighting)
- i18n gaps for backup and KG-KB linking: **RESOLVED** (all 6 languages)

---

### v0.47.0 — KB Batch Ops & Backup Real Implementation (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK

**Features**:

**A. Batch Tag/Category Assignment** — `backend/app/gateway/routers/knowledge_base.py`:
- `BatchUpdateRequest` / `BatchUpdateResponse` Pydantic models
- `POST /documents/batch-update` endpoint: supports `set`, `add`, `remove` modes for tags, plus category update
- Single-lock atomic operation with one persistence call

**Frontend** — `core/knowledge-base/` + `page.tsx`:
- Types: `BatchUpdateRequest`, `BatchUpdateResponse` interfaces
- API: `batchUpdateDocuments(req)` → `POST /documents/batch-update`
- Hook: `useBatchUpdateDocuments()` mutation with query invalidation
- UI: "Batch Edit" button in batch header → `BatchEditDialog` with mode selector (Set/Add/Remove), category dropdown, tag input

**B. Single-Document Reindex** — `knowledge_base.py`:
- `POST /documents/{doc_id}/reindex`: re-reads source file, re-extracts text via `_extract_text()`, re-chunks via `_smart_chunk()`, rebuilds index, recomputes embeddings in background
- Returns updated `DocumentMeta`

**Frontend** — `core/knowledge-base/` + `page.tsx`:
- API: `reindexDocument(docId)` → `POST /documents/{id}/reindex`
- Hook: `useReindexDocument()` mutation
- UI: "Reindex" button (RefreshCwIcon) in DocumentRow actions, spinner during reindex

**C. Backup Real ZIP + Restore** — `backend/app/gateway/routers/backup.py`:
- Enhanced `POST /create`: gathers KB (JSON + docs + vectors), KG, config, memory → creates `.zip` with `zipfile.ZIP_DEFLATED`
- `archivePath` + real `size` stored in entry, `contents[]` populated with type/count/size
- Old archives auto-cleaned on max backup enforcement
- New `POST /restore`: extracts archive → copies files to base_dir, supports merge strategies (`overwrite` / `merge` / `skip`)
- `BackupRestoreRequest` / `BackupRestoreResponse` models

**Frontend** — `core/backup/` + `backup/page.tsx`:
- Types: `BackupRestoreRequest`, `BackupRestoreResponse`
- API: `restoreBackup(req)`, Hook: `useRestoreBackup()`
- UI: `confirmRestore()` wired to mutation with merge strategy + components

**D. i18n** — 7 files, 14 new keys across 6 languages:
- `knowledgeBase.documents`: `batchUpdate*` (8 keys) + `reindexDoc/reindexing/reindexSuccess` (3 keys)
- `backup`: `restoreProgress/Success/Failed/NoArchive` (4 keys)

**File Changes**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/knowledge_base.py` | MODIFIED | +90 |
| `backend/app/gateway/routers/backup.py` | MODIFIED | +150 |
| `frontend/src/core/knowledge-base/types.ts` | MODIFIED | +12 |
| `frontend/src/core/knowledge-base/api.ts` | MODIFIED | +20 |
| `frontend/src/core/knowledge-base/hooks.ts` | MODIFIED | +25 |
| `frontend/src/core/knowledge-base/index.ts` | MODIFIED | +4 |
| `frontend/src/app/workspace/knowledge-base/page.tsx` | MODIFIED | +80 |
| `frontend/src/core/backup/types.ts` | MODIFIED | +10 |
| `frontend/src/core/backup/api.ts` | MODIFIED | +10 |
| `frontend/src/core/backup/hooks.ts` | MODIFIED | +12 |
| `frontend/src/app/workspace/backup/page.tsx` | MODIFIED | +15 |
| `frontend/src/core/i18n/locales/types.ts` | MODIFIED | +14 |
| `frontend/src/core/i18n/locales/` (6 files) | MODIFIED | +84 |
| **Total** | **13 files** | **~526 lines** |

**Technical Debt Resolved**:
- ✅ Batch operations extended with tag/category editing (was delete-only)
- ✅ Single-document reindex available (was global-only)
- ✅ Backup creates real ZIP archives with actual content (was metadata-only, size=0)
- ✅ Restore endpoint fully functional with merge strategies
- ✅ 14 new i18n keys across 6 languages

**New Technical Debt**:
- Auto-backup scheduling not implemented (interval timer)
- KG entity auto-extraction pipeline not wired
- PDF/DOCX dependency auto-install UX not implemented

**Remaining Candidates** (for next iteration — v0.49):
1. PDF/DOCX dependency auto-install UX
2. Batch document import (folder upload, ZIP extraction)
3. Backup auto-scheduling implementation
4. KG entity auto-extraction pipeline wiring
5. i18n coverage for tools/plugins/memory migrated pages

---
### v0.48.0 — P1 Pages Migration: Mock → REST API (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, 0 Next.js build errors, Python syntax OK

**Features**:

**A. Memory Page Migration** — `app/workspace/memory/page.tsx`:
- Removed `window.electronAPI.conversationMemory.*` mock calls
- Created `frontend/src/core/conversation-memory/` module (types/api/hooks/index, ~120 lines)
- Backend `conversation_memory.py` already existed — enhanced `MemoryStatsResponse` with `totalTopics` and `totalSummaries` fields
- Page now uses `useMemories()`, `useMemoryStats()`, `useUpdateMemory()`, `useDeleteMemory()` hooks
- `EditMemoryDialog` wired to `updateMutation.mutateAsync()`

**B. Tools Page Migration** — `app/workspace/tools/page.tsx`:
- Created `backend/app/gateway/routers/tools.py` (~290 lines): 15 mock tool definitions + 5 endpoints (list, detail, analytics, top, stats)
- Created `frontend/src/core/tools-registry/` module (types/api/hooks/index, ~150 lines)
- Endpoints: `GET /api/electron/tools`, `GET /{id}`, `GET /analytics`, `GET /top`, `GET /stats`
- Deterministic random seed (42) for analytics consistency
- Page uses `useTools()`, `useToolAnalytics()`, `useTopTools()`, `useToolStats()` hooks

**C. Plugins Page Migration** — `app/workspace/plugins/page.tsx`:
- Created `backend/app/gateway/routers/plugins.py` (~290 lines): 8 mock plugins + full CRUD + JSON persistence
- Created `frontend/src/core/plugins/` module (types/api/hooks/index, ~150 lines)
- Endpoints: `GET /api/electron/plugins`, `GET /{id}`, `PUT /{id}/enable`, `PUT /{id}/disable`, `DELETE /{id}`, `GET /stats`
- **Wired Enable/Disable/Uninstall buttons** (previously had no onClick handlers)
- Buttons show loading states via `mutation.isPending`
- Persistence: `plugins.json` with asyncio.Lock + seed from mock on first run

**D. Backend Router Registration** — `app.py` + `routers/__init__.py`:
- Added missing `_restore_cm_state()` / `_persist_cm_state()` lifecycle functions
- Added `_restore_plugins_state()` / `_persist_plugins_state()` lifecycle functions
- Registered `tools.router` and `plugins.router` via `include_router`
- Updated `__init__.py` imports and `__all__` list

**File Changes**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/tools.py` | **NEW** | ~290 |
| `backend/app/gateway/routers/plugins.py` | **NEW** | ~290 |
| `backend/app/gateway/routers/conversation_memory.py` | MODIFIED | +6 |
| `backend/app/gateway/routers/__init__.py` | MODIFIED | +2 |
| `backend/app/gateway/app.py` | MODIFIED | +30 |
| `frontend/src/core/conversation-memory/types.ts` | **NEW** | ~30 |
| `frontend/src/core/conversation-memory/api.ts` | **NEW** | ~40 |
| `frontend/src/core/conversation-memory/hooks.ts` | **NEW** | ~40 |
| `frontend/src/core/conversation-memory/index.ts` | **NEW** | ~5 |
| `frontend/src/core/tools-registry/types.ts` | **NEW** | ~45 |
| `frontend/src/core/tools-registry/api.ts` | **NEW** | ~45 |
| `frontend/src/core/tools-registry/hooks.ts` | **NEW** | ~35 |
| `frontend/src/core/tools-registry/index.ts` | **NEW** | ~5 |
| `frontend/src/core/plugins/types.ts` | **NEW** | ~20 |
| `frontend/src/core/plugins/api.ts` | **NEW** | ~50 |
| `frontend/src/core/plugins/hooks.ts` | **NEW** | ~40 |
| `frontend/src/core/plugins/index.ts` | **NEW** | ~5 |
| `frontend/src/app/workspace/memory/page.tsx` | MODIFIED | -80 +40 |
| `frontend/src/app/workspace/tools/page.tsx` | MODIFIED | -80 +30 |
| `frontend/src/app/workspace/plugins/page.tsx` | MODIFIED | -60 +40 |
| **Total** | **20 files** | **~1,270 lines** |

**Technical Debt Resolved**:
- ✅ Memory Browser page migrated from 100% mock `window.electronAPI` to REST API + React Query
- ✅ Tools Registry page migrated from mock to real backend (15 tools + analytics)
- ✅ Plugins Manager page migrated from mock to real backend (8 plugins + CRUD)
- ✅ Enable/Disable/Uninstall buttons now functional (was placeholder UI only)
- ✅ Conversation memory lifecycle persistence fixed (was missing from app.py)

**New Technical Debt**:
- Tools backend uses mock-only data (no real tool discovery pipeline)
- Plugins backend seeds mock data on first run (no real plugin system integration)
- No i18n coverage for tools/plugins pages
- Auto-backup scheduling not implemented (interval timer)
- KG entity auto-extraction pipeline not wired

**Migration Pattern Established** (v0.48 formalizes the pattern):
```
Frontend Core Module (4 files):
  types.ts → TypeScript interfaces
  api.ts   → REST fetch functions (getBackendBaseURL + fetchJson)
  hooks.ts → React Query hooks (useQuery/useMutation)
  index.ts → barrel export

Backend Router (1 file):
  routers/<module>.py → APIRouter(prefix="/api/electron/<module>")
  Pattern: in-memory dict + JSON persistence + asyncio.Lock + Pydantic

Page Modification:
  Replace: useState + useEffect + window.electronAPI.*
  With:    React Query hooks from @/core/<module>
```

---
### v0.49.0 — Scheduler Loop + Audit Migration + Backup Auto-Scheduling (2026-05-03) ✅

**Status**: Complete | **Build**: 0 TypeScript errors, Python syntax OK, Next.js compiled successfully

**Features**:

**A. Scheduler Page Fix** — `app/workspace/scheduler/page.tsx`:
- Removed local type definitions and `window.electronAPI.scheduler.*` mock calls
- Migrated to `@/core/scheduler` React Query hooks: `useTasks()`, `useSchedulerStats()`, `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`, `useEnableTask()`, `useDisableTask()`, `useRunTaskNow()`, `useTaskHistory()`
- Fixed all type mismatches: `title`→`name`, `category`→`type`, `scheduleType`→`schedule.type`, `enabled`→`config.enabled`, `lastRun`→`lastRunAt`
- `TaskFormDialog` now uses mutations with proper `TaskSchedule`/`TaskAction`/`TaskConfig` building
- Added `atTime` field for one-time schedule datetime-local input

**B. Scheduler Background Loop** — `backend/app/gateway/routers/scheduler.py`:
- Added `_scheduler_loop()`: asyncio.Task polling every 15s, evaluates once/interval tasks
- Added `_execute_task(task)`: dispatches to handlers, supports `system:backup` delegation
- Added loop control endpoints: `POST /loop/start`, `POST /loop/stop`, `GET /loop/status`
- Added `get_tasks()` utility for cross-module import (used by backup.py)
- Lifecycle integration in `app.py` lifespan: start before yield, stop after yield

**C. Audit Backend Router** — `backend/app/gateway/routers/audit.py` (~230 lines):
- Prefix: `/api/electron/audit`
- Endpoints: `GET /events` (query with category/severity/since/until/limit/offset), `GET /stats`, `GET /recent`, `POST /examine` (integrity), `GET /export/json`, `GET /export/csv`
- In-memory list + JSON persistence (`audit_events.json`) + `asyncio.Lock`
- 50 mock seed events across 9 categories (security/data/system/user/session/workflow/mcp/skill/config) with SHA-256 hash chain simulation

**D. Audit Frontend Core Module** — `frontend/src/core/audit/` (4 files, ~100 lines):
- `types.ts`: `AuditEvent`, `AuditStats`, `IntegrityResult`, `AuditQuery`, `AuditActor`, `AuditTarget`
- `api.ts`: `queryAuditEvents()`, `getAuditStats()`, `getRecentAudit()`, `verifyAuditIntegrity()`, `exportAuditJSON()`, `exportAuditCSV()`
- `hooks.ts`: `useAuditEvents()`, `useAuditStats()`, `useAuditRecent()`, `useVerifyIntegrity()`
- `index.ts`: barrel export

**E. Audit Page Migration** — `app/workspace/audit/page.tsx`:
- Removed local type definitions and `window.electronAPI.audit.*` calls
- Replaced with `@/core/audit` React Query hooks
- Export buttons now functional (blob download for JSON/CSV)
- Refresh button calls `refetch()` from React Query
- Integrity verification uses `useVerifyIntegrity()` mutation

**F. Backup Auto-Scheduling** — `backend/app/gateway/routers/backup.py`:
- Extracted `create_backup_async()` — reusable core backup creation logic (callable from scheduler loop without HTTP context)
- Refactored `create_backup` endpoint to delegate to `create_backup_async()`
- Added auto-backup endpoints: `GET /auto-backup/status`, `POST /auto-backup/start`, `POST /auto-backup/stop`
- `get_backup_stats()` now queries real scheduler for `nextScheduledBackup`
- Frontend auto-backup hooks: `useAutoBackupStatus()`, `useToggleAutoBackup()`
- New `AutoBackupStatus` type definition

**G. Registration & Lifecycle** — `app.py` + `routers/__init__.py`:
- Added `_restore_audit_state()` / `_persist_audit_state()` lifecycle functions
- Added `start_scheduler_loop()` / `stop_scheduler_loop()` in lifespan
- Registered `audit.router` via `include_router`

**File Changes**:

| File | Action | Lines |
|------|--------|-------|
| `backend/app/gateway/routers/scheduler.py` | MODIFIED | +100 |
| `backend/app/gateway/routers/audit.py` | NEW | ~230 |
| `backend/app/gateway/routers/backup.py` | MODIFIED | +130 |
| `backend/app/gateway/app.py` | MODIFIED | +30 |
| `backend/app/gateway/routers/__init__.py` | MODIFIED | +2 |
| `frontend/src/core/scheduler/types.ts` | MODIFIED | +2 |
| `frontend/src/app/workspace/scheduler/page.tsx` | MODIFIED | -100 +60 |
| `frontend/src/core/audit/types.ts` | NEW | ~60 |
| `frontend/src/core/audit/api.ts` | NEW | ~70 |
| `frontend/src/core/audit/hooks.ts` | NEW | ~40 |
| `frontend/src/core/audit/index.ts` | NEW | ~3 |
| `frontend/src/app/workspace/audit/page.tsx` | MODIFIED | -70 +55 |
| `frontend/src/core/backup/types.ts` | MODIFIED | +6 |
| `frontend/src/core/backup/api.ts` | MODIFIED | +12 |
| `frontend/src/core/backup/hooks.ts` | MODIFIED | +20 |
| **Total** | **15 files** | **~760 lines** |

**Technical Debt Resolved**:
- ✅ Scheduler page migrated from mock `window.electronAPI` to REST API + React Query
- ✅ Scheduler background execution loop implemented (asyncio.Task polling every 15s)
- ✅ Audit page migrated from mock to full backend router + React Query
- ✅ Backup auto-scheduling implemented via scheduler integration
- ✅ `nextScheduledBackup` in backup stats now reads real scheduler task
- ✅ Export buttons on audit page now functional (JSON/CSV blob download)

**New Technical Debt**:
- Audit backend uses mock seed data (no real audit event pipeline from agents)
- Auto-backup task persistence across restarts: scheduler task re-created on startup if config.enabled=true
- Audit integrity verification is simplified (hash length check only, not full chain)
- No i18n coverage for audit/scheduler pages

**Remaining Candidates** (for next iteration — v0.50):
1. Reasoning page migration (backend + frontend core)
2. Security page migration
3. i18n coverage expansion for migrated pages
4. KG entity auto-extraction pipeline wiring
5. PDF/DOCX dependency auto-install UX

---
## v0.50.0 — Reasoning & Security Page Migration (2026-05-03)

### Reasoning Page — `window.electronAPI` → REST API + React Query

**Backend: `routers/reasoning.py`** (~330 lines)
- 4 endpoints at `/api/electron/reasoning`: traces (list/search), traces/{id} (detail), traces/{id} (delete), stats
- 8 mock traces across 5 strategies (ReAct, CoT, ToT, Direct, Reflection) with realistic multi-step chains
- JSON persistence (`reasoning_traces.json`) + asyncio.Lock + Pydantic models
- Server-side search filtering (goal + strategy), optional strategy/status filters

**Frontend: `@/core/reasoning`** (4 files, ~120 lines)
- `types.ts` — ReasoningStep, ReasoningTrace, ReasoningStats types with StepMetadata/TraceListResponse
- `api.ts` — listTraces(params), getTrace(id), deleteTrace(id), getReasoningStats()
- `hooks.ts` — useReasoningTraces(), useReasoningStats(), useDeleteReasoningTrace(), useReasoningTrace()
- `index.ts` — barrel export

**Page: `workspace/reasoning/page.tsx`** (migrated)
- Removed inline TypeScript interfaces (now from @/core/reasoning)
- Replaced `useEffect`+`window.electronAPI.reasoning.*` with React Query hooks
- wired handleRefresh → `queryClient.invalidateQueries({ queryKey: ["reasoning"] })`
- Delete button: `disabled={deleteMutation.isPending}` loading state
- Search: now server-side filtered via query params (was client-side filter)
- Export functions (JSON/Markdown blob download) retained — browser-side op

### Security Page — `window.electronAPI` + hardcoded mock → REST API + React Query

**Backend: `routers/security.py`** (~240 lines)
- 3 endpoints at `/api/electron/security`: stats, policies (with category/enabled filters), rate-limit
- 12 mock security policies (Allow/Deny/Prompt types) across 5 categories
- Deterministic rate-limit simulation using process uptime + hash; resets every 60s window
- JSON persistence (`security_policies.json`) + asyncio.Lock + Pydantic models

**Frontend: `@/core/security`** (4 files, ~80 lines)
- `types.ts` — SecurityPolicy, SecurityStats, RateLimitStatus, PolicyListResponse
- `api.ts` — getSecurityStats(), listPolicies(params), getRateLimit()
- `hooks.ts` — useSecurityStats(), useSecurityPolicies(), useRateLimitStatus(15s auto-refetch)
- `index.ts` — barrel export

**Page: `workspace/security/page.tsx`** (migrated)
- Removed inline interfaces; imports from @/core/security
- Replaced `useState`+hardcoded mock with 3 React Query hooks
- Security score computation preserved inline (6-factor weighted average)
- Refresh button wired to `queryClient.invalidateQueries({ queryKey: ["security"] })`
- All UI (PolicyBadge, score card, feature cards, rate-limit card) unchanged

### Backend Registration (app.py + __init__.py)
- Added `reasoning` and `security` to routers/__init__.py imports and __all__
- Added `app.include_router(reasoning.router)` and `app.include_router(security.router)`
- Added 4 lifecycle hooks: `_restore_reasoning_state` / `_persist_reasoning_state` / `_restore_security_state` / `_persist_security_state`

### File Changes (14 files, ~800 lines)

| Module | Type | Files | Lines |
|--------|------|-------|-------|
| Backend - reasoning | NEW | 1 | ~330 |
| Backend - security | NEW | 1 | ~240 |
| Backend - config | MODIFIED | 2 (app.py + __init__.py) | ~30 |
| Frontend - reasoning core | NEW | 4 | ~120 |
| Frontend - security core | NEW | 4 | ~80 |
| Frontend - pages | MODIFIED | 2 (reasoning + security) | ~10 net |
| **Total** | | **14 files** | **~810 lines** |

### Technical Debt
- ✅ Reasoning page migrated (was `window.electronAPI`)
- ✅ Security page migrated (was hardcoded mock data)
- ❌ 13 pages remaining: settings, notifications, shortcuts, theme, onboarding, plugin-sdk, plugin-monitor, tool-tester, data-manager, session-export, templates, search, command-palette

### Next Candidates (v0.52)
1. Shortcuts page migration 2. Theme page migration 3. i18n expansion 4. KG pipeline 5. PDF/DOCX UX

---

## v0.51.0 — Settings & Notifications Page Migration (2026-05-03)

### Settings Page — `window.electronAPI` → REST API + React Query

**Backend: `routers/settings_workspace.py`** (~210 lines)
- 4 endpoints at `/api/electron/settings`: GET (read), PUT (partial merge), POST /reset (factory defaults), GET /about (system info)
- 4 nested Pydantic models: GeneralSettings, AppearanceSettings, WorkspaceNotificationSettings, AdvancedSettings
- Deep-merge partial update — only sent sections are applied; missing keys preserved
- JSON persistence (`electron_settings.json`) + asyncio.Lock + defaults fallback

**Frontend: `@/core/electron-settings`** (4 files, ~150 lines)
- `types.ts` — 8 interfaces (GeneralSettings through AppInfo)
- `api.ts` — getSettings, saveSettings(data), resetSettings, getAppInfo
- `hooks.ts` — useElectronSettings (60s stale), useAppInfo (5min stale), useSaveSettings (optimistic setQueryData), useResetSettings
- `index.ts` — barrel export

**Page: `workspace/settings/page.tsx`** (migrated)
- Removed inline TypeScript interfaces — imports from @/core/electron-settings
- Replaced `useEffect`+`window.electronAPI.settings.read/write` with React Query hooks
- Local state synced from server on load via `useEffect` watching query data
- Save button: `disabled={!hasChanges || saveMutation.isPending}` with spinner
- Reset button: `disabled={resetMutation.isPending}`
- Theme/accent/font-size CSS variables applied in save handler (retained from original)
- About section: reads real `appInfo` from API (appVersion, electronVersion, nodeVersion, pythonVersion, platform)

### Notifications Page — localStorage mock → REST API + React Query

**Backend: `routers/notifications.py`** (~300 lines)
- 6 endpoints at `/api/electron/notifications`:
  - GET (list with category/severity/unread_only/limit/offset filters)
  - POST /mark-read (single/array or all when body empty)
  - DELETE /{id} (single)
  - POST /clear (clear all)
  - GET /settings, PUT /settings (notification preferences)
- 15 mock notifications across 6 categories (system/agent/workflow/security/mcp/update)
- JSON persistence (`notifications.json`) + asyncio.Lock

**Frontend: `@/core/app-notifications`** (4 files, ~150 lines)
- `types.ts` — NotificationSeverity, NotificationCategory, AppNotification, NotificationListResponse, NotificationSettingsModel, MarkReadRequest
- `api.ts` — listNotifications, markNotificationsRead, deleteNotification, clearAllNotifications, getNotificationSettings, updateNotificationSettings
- `hooks.ts` — useNotifications (15s stale), useNotificationSettings (60s stale), 4 mutations with auto-invalidation
- `index.ts` — barrel export

**Page: `workspace/notifications/page.tsx`** (migrated)
- Removed `generateMockNotifications()`, `generateMockSettings()`, localStorage helpers, `wsMessageToNotification`
- Replaced with 6 React Query hooks
- Category filter pills wired to server-side filtering via query params
- Mark-read/delete/clear-all use mutations → onSuccess invalidateQueries
- Sidebar category toggles use updateNotificationSettings mutation

### Backend Registration (app.py + __init__.py)
- Added `notifications` and `settings_workspace` to routers/__init__.py
- Added `app.include_router()` for both routers in app.py
- Added 4 lifecycle hooks: restore/persist settings state, restore/persist notifications state

### File Changes (18 files, ~890 lines)

| Module | Type | Files | Lines |
|--------|------|-------|-------|
| Backend - settings_workspace | NEW | 1 | ~210 |
| Backend - notifications | NEW | 1 | ~300 |
| Backend - config | MODIFIED | 2 (app.py + __init__.py) | ~30 |
| Frontend - electron-settings | NEW | 4 | ~150 |
| Frontend - app-notifications | NEW | 4 | ~150 |
| Frontend - pages | MODIFIED | 2 (settings + notifications) | ~50 net |
| **Total** | | **18 files** | **~890 lines** |

### Technical Debt
- ✅ Settings page migrated (was `window.electronAPI`)
- ✅ Notifications page migrated (was localStorage mock data)
- ❌ 11 pages remaining: shortcuts, theme, onboarding, plugin-sdk, plugin-monitor, tool-tester, data-manager, session-export, templates, search, command-palette

---

## Last Updated
2026-05-03 23:53 CST (v0.51.0)


