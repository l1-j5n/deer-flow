# DeerFlow Electron Agent Platform - User Guide

> Version: 2.0.0 | Last Updated: 2026-05-01

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [First Run Setup](#first-run-setup)
4. [Main Interface](#main-interface)
5. [Workspace Pages](#workspace-pages)
6. [Settings](#settings)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

---

## Getting Started

DeerFlow Electron Agent Platform is a desktop application that wraps the DeerFlow 2.0 super agent harness in a native Electron shell. It provides:

- **Native desktop experience** with system tray integration
- **Built-in service management** — LangGraph agent server, FastAPI gateway, and Next.js frontend
- **Built-in proxy** — replaces nginx, no external dependencies
- **40+ backend modules** including health monitoring, collaboration, knowledge graph, and more
- **23+ workspace pages** for managing every aspect of your agent platform
- **6 language support** — English, Chinese, Japanese, Korean, German, French

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Windows 10 / macOS 12 / Ubuntu 20.04 | Windows 11 / macOS 14 / Ubuntu 22.04 |
| Node.js | 22.x | 24.x |
| Python | 3.12 | 3.12+ |
| RAM | 8 GB | 16 GB |
| Disk | 2 GB free | 5 GB free |

---

## Installation

### Option 1: Development Mode

```bash
# Clone the repository
git clone https://github.com/bytedance/deer-flow.git
cd deer-flow

# Install dependencies
make install

# Configure models
cp config.example.yaml config.yaml
# Edit config.yaml with your API keys

# Launch Electron app
node start-electron.js
```

### Option 2: Production Build

```bash
# Build static frontend
STATIC_EXPORT=true cd frontend && npx next build

# Build Electron app
cd electron && npm run dist

# Install the generated installer from dist/
```

---

## First Run Setup

On first launch, the app will:

1. **Check prerequisites** — Node.js, Python, pnpm, and virtual environment
2. **Start backend services** — LangGraph (port 2024), Gateway (port 8001), Frontend (port 3000)
3. **Start built-in proxy** — routes all traffic through port 2026
4. **Open Settings** — if no models are configured, the settings window appears automatically

### Adding Your First Model

1. Open Settings (Ctrl/Cmd+,)
2. Go to the **Models** tab
3. Select a provider (OpenAI, Anthropic, DeepSeek, Gemini, OpenRouter, MiniMax)
4. Enter your API key
5. Click **Add Model**
6. Services will restart automatically

---

## Main Interface

### Sidebar Navigation

The left sidebar provides access to all workspace pages:

| Icon | Page | Description |
|------|------|-------------|
| 💬 | Chats | Main conversation interface |
| 🤖 | Agents | Custom agent management |
| 📊 | Dashboard | System overview |
| 🏥 | Health | Service health monitoring |
| 👥 | Collaboration | Multi-agent collaboration |
| 🕸️ | Knowledge Graph | Entity and relation explorer |
| ⏰ | Scheduler | Task scheduling |
| 🧠 | Reasoning | Reasoning trace visualization |
| 📝 | Memory | Conversation memory browser |
| 🔧 | Tools | Tool registry |
| 🛡️ | Audit | Audit log viewer |
| 🔌 | Plugins | Plugin marketplace |
| 🔒 | Security | Security settings |
| ⚡ | Performance | Performance profiling |
| ⌨️ | Shortcuts | Keyboard shortcuts |
| 🎨 | Theme | Theme customization |
| 🔔 | Notifications | Notification center |
| 💾 | Data Manager | Export/import data |
| 🔍 | Search | Advanced cross-module search |
| ⌘ | Command Palette | Quick command access |
| 📋 | Templates | Template marketplace |
| 🧪 | Tool Tester | Interactive tool testing |
| 🔥 | Plugin Monitor | Hot-reload monitoring |
| 📡 | Realtime Dashboard | Live metrics |
| 💿 | Backup | Backup & restore |
| 📈 | Charts | Data analytics |

### System Tray

Right-click the DeerFlow icon in the system tray for quick actions:

- New Chat
- Recent Chats (up to 5)
- Settings
- Service Status
- Diagnostics
- Restart Services
- Quit

---

## Workspace Pages

### Dashboard
System overview with real-time stats: health score, active sessions, memories, tools, and service status.

### Health Monitor
Visual health monitoring with animated score ring, service status grid, resource usage bars, and issue recommendations.

### Agent Collaboration
Multi-agent coordination with 6 roles: coordinator, researcher, critic, executor, synthesizer, specialist. Create sessions, add collaborators, and track task progress.

### Knowledge Graph
Interactive Canvas-based visualization with force-directed physics. Drag nodes, zoom, search entities, and explore relations.

### Task Scheduler
Create and manage scheduled tasks with support for one-time, interval, and cron schedules. Full CRUD operations.

### Reasoning Traces
Visualize agent reasoning with step-by-step flow. Export traces as JSON or Markdown.

### Memory Browser
Browse conversation memories with search, filtering by type (fact, preference, relationship, event, concept), and edit/delete operations.

### Tool Registry
Explore registered tools with parameter schemas, usage analytics, and context-aware recommendations.

### Audit Log
View security audit events with integrity verification. Filter by category and severity.

### Plugin Marketplace
Manage plugins with enable/disable, configure, and uninstall actions.

### Security Settings
View security score, encryption status, rate limiting, and policy configuration.

### Performance Profiling
Health score ring, response time percentiles (P50/P95/P99), trends, alerts, and optimization recommendations.

### Data Manager
Export and import data across 8 modules: sessions, workflows, memories, knowledge graph, tools, audit, collaboration, reasoning.

### Advanced Search
Global search across all modules with debounced input, recent searches, and relevance scoring.

### Charts
Data visualization with Recharts: area charts, pie charts, radar charts, line charts, and bar charts.

---

## Settings

### General
- **Language** — 6 languages supported
- **Startup Behavior** — restore session, new chat, or dashboard
- **Minimize/Close to Tray** — keep running in background
- **Auto Update** — automatic update checks
- **Telemetry** — opt-in anonymous usage data

### Appearance
- **Theme** — System / Light / Dark
- **Accent Color** — 8 color choices
- **Font Size** — Small / Medium / Large
- **Animations** — enable/disable UI animations

### Notifications
- Master switch and per-category toggles
- Desktop notifications support
- Sound effects

### Security
- AES-256-GCM encryption status
- Rate limiting toggle
- Input sanitization
- Path validation

### Advanced
- Developer mode
- Debug logging
- Cache size limit
- Max concurrent tasks
- Request timeout

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd+N` | New Chat |
| `Ctrl/Cmd+B` | Toggle Sidebar |
| `Ctrl/Cmd+,` | Open Settings |
| `Ctrl/Cmd+K` | Open Command Palette |
| `Ctrl/Cmd+R` | Reload |
| `Ctrl/Cmd+Shift+R` | Force Reload |
| `Ctrl/Cmd+Shift+S` | Service Status |

---

## Troubleshooting

### Services Won't Start

1. Check that ports 2024, 8001, 3000, 2026 are not in use
2. Verify Python virtual environment is set up: `cd backend && uv sync`
3. Check logs: `electron/logs/main.log`

### Frontend Not Loading

1. Wait 30-60 seconds for Next.js dev server to start
2. Check proxy health in Settings > Services
3. Try restarting services from system tray

### API Key Not Working

1. Verify the key is saved to `.env` file
2. Check that the correct environment variable name is used
3. Restart services after adding a model

### TypeScript Errors

```bash
cd frontend && pnpm exec tsc --noEmit
cd electron && npx tsc --noEmit
```

---

## FAQ

**Q: Can I use DeerFlow without an API key?**
A: No, you need at least one LLM API key (OpenAI, Anthropic, DeepSeek, etc.) to use the agent functionality.

**Q: Is my data stored locally?**
A: Yes, all data including memories, knowledge graph, and settings are stored locally on your machine.

**Q: Can I run DeerFlow in a browser instead of Electron?**
A: Yes, use `make dev` to run the standard web version without Electron.

**Q: How do I add custom skills?**
A: Place skill directories in `skills/custom/` following the SKILL.md format, or use the skill creator in the app.

**Q: What models are supported?**
A: Any OpenAI-compatible API including OpenAI, Anthropic, DeepSeek, Gemini, OpenRouter, MiniMax, and more.

**Q: How do I update the app?**
A: The app checks for updates automatically. You can also manually check via the system tray menu.

**Q: Can I contribute translations?**
A: Yes! Add translation files in `frontend/src/core/i18n/locales/` following the existing pattern.

---

## Support

- GitHub Issues: https://github.com/bytedance/deer-flow/issues
- Documentation: https://deerflow.tech
- Community: https://github.com/bytedance/deer-flow/discussions
