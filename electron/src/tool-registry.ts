/**
 * DeerFlow Electron - Tool Registry & Discovery
 *
 * Centralized tool management and discovery system:
 * - Tool metadata registry with categorization
 * - Tool usage analytics and performance tracking
 * - Context-aware tool recommendations
 * - Dynamic tool loading and validation
 * - Tool dependency management
 * - Tool versioning and compatibility
 *
 * Integrates with MCP Manager, Skill Manager, and EventBus.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type ToolCategory =
  | "web"
  | "file"
  | "data"
  | "code"
  | "communication"
  | "search"
  | "analysis"
  | "media"
  | "system"
  | "custom";

export type ToolStatus = "available" | "deprecated" | "experimental" | "disabled";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "enum";
  description: string;
  required: boolean;
  default?: any;
  enumValues?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  parameters: ToolParameter[];
  returnType: {
    type: string;
    description: string;
  };
  status: ToolStatus;
  version: string;
  author?: string;
  source: "builtin" | "mcp" | "skill" | "plugin" | "custom";
  sourceRef?: string; // e.g., mcp server name, skill id
  permissions: string[];
  examples: Array<{
    description: string;
    parameters: Record<string, any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ToolUsageRecord {
  toolId: string;
  sessionId: string;
  timestamp: string;
  durationMs: number;
  success: boolean;
  errorType?: string;
  parameterSummary: Record<string, any>;
  resultSize: number;
}

export interface ToolAnalytics {
  toolId: string;
  totalCalls: number;
  successRate: number;
  averageDuration: number;
  lastUsed: string;
  popularityRank: number;
  errorRate: number;
  commonErrors: Array<{ type: string; count: number }>;
}

export interface ToolRecommendation {
  toolId: string;
  score: number;
  reason: string;
  context: string[];
}

export interface ToolRegistryConfig {
  enableAnalytics: boolean;
  maxUsageHistory: number;
  enableRecommendations: boolean;
  autoDiscover: boolean;
  validationStrictness: "strict" | "lenient";
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: ToolRegistryConfig = {
  enableAnalytics: true,
  maxUsageHistory: 10000,
  enableRecommendations: true,
  autoDiscover: true,
  validationStrictness: "strict",
};

// ============================================================
// Tool Registry
// ============================================================

const REGISTRY_DIR = "tool-registry";
const TOOLS_FILE = "tools.json";
const USAGE_FILE = "usage.json";

export class ToolRegistry extends EventEmitter {
  private projectRoot: string;
  private registryDir: string;
  private tools: Map<string, ToolDefinition> = new Map();
  private usage: ToolUsageRecord[] = [];
  private config: ToolRegistryConfig;
  private dirty = false;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(projectRoot: string, config?: Partial<ToolRegistryConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registryDir = path.join(projectRoot, ".deerflow", REGISTRY_DIR);
    this.ensureDirectories();
    this.loadData();
    this.startAutoSave();

    // Register built-in tools
    this.registerBuiltinTools();
  }

  // ============================================================
  // Tool Registration
  // ============================================================

  /**
   * Register a new tool
   */
  registerTool(tool: Omit<ToolDefinition, "id" | "createdAt" | "updatedAt">): ToolDefinition {
    const existing = this.findToolByName(tool.name);
    if (existing) {
      // Update existing
      const updated: ToolDefinition = {
        ...existing,
        ...tool,
        updatedAt: new Date().toISOString(),
      };
      this.tools.set(existing.id, updated);
      this.dirty = true;
      this.emit("tool:updated", updated);
      return updated;
    }

    const newTool: ToolDefinition = {
      ...tool,
      id: this.generateId("tool"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tools.set(newTool.id, newTool);
    this.dirty = true;

    this.emit("tool:registered", newTool);
    return newTool;
  }

  /**
   * Unregister a tool
   */
  unregisterTool(id: string): boolean {
    const tool = this.tools.get(id);
    if (!tool) return false;

    this.tools.delete(id);
    this.dirty = true;

    this.emit("tool:unregistered", id);
    return true;
  }

  /**
   * Update tool status
   */
  updateToolStatus(id: string, status: ToolStatus): boolean {
    const tool = this.tools.get(id);
    if (!tool) return false;

    tool.status = status;
    tool.updatedAt = new Date().toISOString();
    this.dirty = true;

    this.emit("tool:status-changed", tool);
    return true;
  }

  // ============================================================
  // Tool Query
  // ============================================================

  /**
   * Get a tool by ID
   */
  getTool(id: string): ToolDefinition | null {
    return this.tools.get(id) || null;
  }

  /**
   * Find tool by name
   */
  findToolByName(name: string): ToolDefinition | null {
    for (const tool of this.tools.values()) {
      if (tool.name === name) return tool;
    }
    return null;
  }

  /**
   * Search tools
   */
  searchTools(query: {
    category?: ToolCategory;
    tags?: string[];
    search?: string;
    source?: ToolDefinition["source"];
    status?: ToolStatus;
    limit?: number;
  } = {}): ToolDefinition[] {
    let results = Array.from(this.tools.values());

    if (query.category) {
      results = results.filter((t) => t.category === query.category);
    }

    if (query.tags) {
      results = results.filter((t) => query.tags!.some((tag) => t.tags.includes(tag)));
    }

    if (query.search) {
      const lower = query.search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(lower) ||
          t.description.toLowerCase().includes(lower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lower))
      );
    }

    if (query.source) {
      results = results.filter((t) => t.source === query.source);
    }

    if (query.status) {
      results = results.filter((t) => t.status === query.status);
    }

    // Sort by name
    results.sort((a, b) => a.name.localeCompare(b.name));

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.searchTools({ category });
  }

  /**
   * Get all available tools
   */
  getAvailableTools(): ToolDefinition[] {
    return this.searchTools({ status: "available" });
  }

  /**
   * List all categories with counts
   */
  getCategories(): Array<{ category: ToolCategory; count: number }> {
    const counts: Record<string, number> = {};
    for (const tool of this.tools.values()) {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category: category as ToolCategory, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ============================================================
  // Validation
  // ============================================================

  /**
   * Validate tool parameters
   */
  validateParameters(toolId: string, params: Record<string, any>): { valid: boolean; errors: string[] } {
    const tool = this.tools.get(toolId);
    if (!tool) return { valid: false, errors: ["Tool not found"] };

    const errors: string[] = [];

    for (const param of tool.parameters) {
      const value = params[param.name];

      // Check required
      if (param.required && (value === undefined || value === null)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }

      if (value === undefined || value === null) continue;

      // Type checking
      const actualType = Array.isArray(value) ? "array" : typeof value;
      if (param.type === "enum") {
        if (!param.enumValues?.includes(String(value))) {
          errors.push(`Invalid enum value for ${param.name}: ${value}`);
        }
      } else if (param.type === "array" && !Array.isArray(value)) {
        errors.push(`Parameter ${param.name} must be an array`);
      } else if (param.type !== "array" && actualType !== param.type) {
        errors.push(`Parameter ${param.name} must be ${param.type}, got ${actualType}`);
      }

      // Validation rules
      if (param.validation) {
        if (param.type === "string" && typeof value === "string") {
          if (param.validation.maxLength && value.length > param.validation.maxLength) {
            errors.push(`Parameter ${param.name} exceeds max length ${param.validation.maxLength}`);
          }
          if (param.validation.pattern && !new RegExp(param.validation.pattern).test(value)) {
            errors.push(`Parameter ${param.name} does not match required pattern`);
          }
        }
        if (param.type === "number" && typeof value === "number") {
          if (param.validation.min !== undefined && value < param.validation.min) {
            errors.push(`Parameter ${param.name} must be >= ${param.validation.min}`);
          }
          if (param.validation.max !== undefined && value > param.validation.max) {
            errors.push(`Parameter ${param.name} must be <= ${param.validation.max}`);
          }
        }
      }
    }

    // Check for unknown parameters in strict mode
    if (this.config.validationStrictness === "strict") {
      const knownParams = new Set(tool.parameters.map((p) => p.name));
      for (const key of Object.keys(params)) {
        if (!knownParams.has(key)) {
          errors.push(`Unknown parameter: ${key}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get parameter schema for a tool
   */
  getParameterSchema(toolId: string): ToolParameter[] | null {
    const tool = this.tools.get(toolId);
    return tool?.parameters || null;
  }

  // ============================================================
  // Usage Analytics
  // ============================================================

  /**
   * Record tool usage
   */
  recordUsage(record: Omit<ToolUsageRecord, "timestamp">): void {
    if (!this.config.enableAnalytics) return;

    const usageRecord: ToolUsageRecord = {
      ...record,
      timestamp: new Date().toISOString(),
    };

    this.usage.push(usageRecord);

    // Trim history
    if (this.usage.length > this.config.maxUsageHistory) {
      this.usage = this.usage.slice(-this.config.maxUsageHistory);
    }

    this.dirty = true;
    this.emit("usage:recorded", usageRecord);
  }

  /**
   * Get analytics for a tool
   */
  getAnalytics(toolId: string): ToolAnalytics | null {
    if (!this.config.enableAnalytics) return null;

    const toolUsage = this.usage.filter((u) => u.toolId === toolId);
    if (toolUsage.length === 0) return null;

    const totalCalls = toolUsage.length;
    const successful = toolUsage.filter((u) => u.success).length;
    const avgDuration = toolUsage.reduce((sum, u) => sum + u.durationMs, 0) / totalCalls;

    // Error analysis
    const errorCounts: Record<string, number> = {};
    for (const u of toolUsage) {
      if (u.errorType) {
        errorCounts[u.errorType] = (errorCounts[u.errorType] || 0) + 1;
      }
    }

    const commonErrors = Object.entries(errorCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Popularity rank
    const toolCallCounts = new Map<string, number>();
    for (const u of this.usage) {
      toolCallCounts.set(u.toolId, (toolCallCounts.get(u.toolId) || 0) + 1);
    }
    const sorted = Array.from(toolCallCounts.entries()).sort((a, b) => b[1] - a[1]);
    const rank = sorted.findIndex(([id]) => id === toolId) + 1;

    return {
      toolId,
      totalCalls,
      successRate: successful / totalCalls,
      averageDuration: avgDuration,
      lastUsed: toolUsage[toolUsage.length - 1].timestamp,
      popularityRank: rank || sorted.length + 1,
      errorRate: (totalCalls - successful) / totalCalls,
      commonErrors,
    };
  }

  /**
   * Get top used tools
   */
  getTopTools(limit: number = 10): Array<{ toolId: string; name: string; calls: number; successRate: number }> {
    const counts = new Map<string, { calls: number; successes: number }>();

    for (const u of this.usage) {
      const current = counts.get(u.toolId) || { calls: 0, successes: 0 };
      current.calls++;
      if (u.success) current.successes++;
      counts.set(u.toolId, current);
    }

    return Array.from(counts.entries())
      .map(([toolId, data]) => {
        const tool = this.tools.get(toolId);
        return {
          toolId,
          name: tool?.name || toolId,
          calls: data.calls,
          successRate: data.calls > 0 ? data.successes / data.calls : 0,
        };
      })
      .sort((a, b) => b.calls - a.calls)
      .slice(0, limit);
  }

  // ============================================================
  // Recommendations
  // ============================================================

  /**
   * Get tool recommendations based on context
   */
  getRecommendations(context: {
    query?: string;
    category?: ToolCategory;
    recentTools?: string[];
    sessionHistory?: string[];
  }): ToolRecommendation[] {
    if (!this.config.enableRecommendations) return [];

    const available = this.getAvailableTools();
    const recommendations: ToolRecommendation[] = [];

    for (const tool of available) {
      let score = 0;
      const reasons: string[] = [];

      // Query relevance
      if (context.query) {
        const lowerQuery = context.query.toLowerCase();
        if (tool.name.toLowerCase().includes(lowerQuery)) {
          score += 3;
          reasons.push("Name matches query");
        }
        if (tool.description.toLowerCase().includes(lowerQuery)) {
          score += 2;
          reasons.push("Description matches query");
        }
        if (tool.tags.some((t) => t.toLowerCase().includes(lowerQuery))) {
          score += 1.5;
          reasons.push("Tags match query");
        }
      }

      // Category match
      if (context.category && tool.category === context.category) {
        score += 2;
        reasons.push("Same category");
      }

      // Recent usage boost (familiarity)
      if (context.recentTools?.includes(tool.id)) {
        score += 1;
        reasons.push("Recently used");
      }

      // Popularity boost
      const analytics = this.getAnalytics(tool.id);
      if (analytics) {
        score += analytics.successRate * 2;
        if (analytics.popularityRank <= 5) {
          score += 1;
          reasons.push("Popular tool");
        }
      }

      // New/experimental penalty
      if (tool.status === "experimental") {
        score -= 0.5;
      }

      if (score > 0) {
        recommendations.push({
          toolId: tool.id,
          score,
          reason: reasons.join(", ") || "General recommendation",
          context: [tool.category, ...tool.tags.slice(0, 3)],
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // ============================================================
  // Built-in Tools
  // ============================================================

  private registerBuiltinTools(): void {
    const builtins: Array<Omit<ToolDefinition, "id" | "createdAt" | "updatedAt">> = [
      {
        name: "web_search",
        description: "Search the web for information",
        category: "web",
        tags: ["search", "web", "internet"],
        parameters: [
          {
            name: "query",
            type: "string",
            description: "Search query",
            required: true,
            validation: { maxLength: 500 },
          },
          {
            name: "limit",
            type: "number",
            description: "Maximum results",
            required: false,
            default: 5,
            validation: { min: 1, max: 20 },
          },
        ],
        returnType: { type: "array", description: "Array of search results" },
        status: "available",
        version: "1.0.0",
        source: "builtin",
        permissions: ["network"],
        examples: [
          { description: "Basic search", parameters: { query: "quantum computing" } },
          { description: "Limited results", parameters: { query: "AI news", limit: 3 } },
        ],
      },
      {
        name: "read_file",
        description: "Read contents of a file",
        category: "file",
        tags: ["file", "read", "filesystem"],
        parameters: [
          {
            name: "path",
            type: "string",
            description: "File path",
            required: true,
          },
          {
            name: "encoding",
            type: "enum",
            description: "File encoding",
            required: false,
            default: "utf-8",
            enumValues: ["utf-8", "base64", "binary"],
          },
        ],
        returnType: { type: "string", description: "File contents" },
        status: "available",
        version: "1.0.0",
        source: "builtin",
        permissions: ["file_read"],
        examples: [
          { description: "Read text file", parameters: { path: "/path/to/file.txt" } },
        ],
      },
      {
        name: "write_file",
        description: "Write content to a file",
        category: "file",
        tags: ["file", "write", "filesystem"],
        parameters: [
          {
            name: "path",
            type: "string",
            description: "File path",
            required: true,
          },
          {
            name: "content",
            type: "string",
            description: "Content to write",
            required: true,
          },
          {
            name: "append",
            type: "boolean",
            description: "Append instead of overwrite",
            required: false,
            default: false,
          },
        ],
        returnType: { type: "boolean", description: "Success status" },
        status: "available",
        version: "1.0.0",
        source: "builtin",
        permissions: ["file_write"],
        examples: [
          { description: "Write new file", parameters: { path: "/path/to/file.txt", content: "Hello" } },
        ],
      },
      {
        name: "execute_code",
        description: "Execute code in a sandboxed environment",
        category: "code",
        tags: ["code", "execute", "sandbox"],
        parameters: [
          {
            name: "language",
            type: "enum",
            description: "Programming language",
            required: true,
            enumValues: ["python", "javascript", "bash"],
          },
          {
            name: "code",
            type: "string",
            description: "Code to execute",
            required: true,
          },
          {
            name: "timeout",
            type: "number",
            description: "Execution timeout in seconds",
            required: false,
            default: 30,
            validation: { min: 1, max: 300 },
          },
        ],
        returnType: { type: "object", description: "Execution result with stdout, stderr, exit code" },
        status: "available",
        version: "1.0.0",
        source: "builtin",
        permissions: ["code_execution"],
        examples: [
          { description: "Run Python", parameters: { language: "python", code: "print('hello')" } },
        ],
      },
      {
        name: "data_analysis",
        description: "Analyze data with statistical operations",
        category: "analysis",
        tags: ["data", "analysis", "statistics"],
        parameters: [
          {
            name: "data",
            type: "array",
            description: "Data array",
            required: true,
          },
          {
            name: "operation",
            type: "enum",
            description: "Analysis operation",
            required: true,
            enumValues: ["sum", "mean", "median", "mode", "std", "min", "max", "count"],
          },
        ],
        returnType: { type: "number", description: "Analysis result" },
        status: "available",
        version: "1.0.0",
        source: "builtin",
        permissions: [],
        examples: [
          { description: "Calculate mean", parameters: { data: [1, 2, 3, 4, 5], operation: "mean" } },
        ],
      },
    ];

    for (const tool of builtins) {
      this.registerTool(tool);
    }
  }

  // ============================================================
  // Statistics
  // ============================================================

  getStats(): {
    totalTools: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
    byStatus: Record<string, number>;
    totalUsageRecords: number;
    topTools: { toolId: string; count: number }[];
  } {
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const toolUsageCount: Record<string, number> = {};

    for (const tool of this.tools.values()) {
      byCategory[tool.category] = (byCategory[tool.category] || 0) + 1;
      bySource[tool.source] = (bySource[tool.source] || 0) + 1;
      byStatus[tool.status] = (byStatus[tool.status] || 0) + 1;
    }

    for (const u of this.usage) {
      toolUsageCount[u.toolId] = (toolUsageCount[u.toolId] || 0) + 1;
    }

    const topTools = Object.entries(toolUsageCount)
      .map(([toolId, count]) => ({ toolId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalTools: this.tools.size,
      byCategory,
      bySource,
      byStatus,
      totalUsageRecords: this.usage.length,
      topTools,
    };
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.registryDir)) {
      fs.mkdirSync(this.registryDir, { recursive: true });
    }
  }

  private startAutoSave(): void {
    this.saveTimer = setInterval(() => {
      if (this.dirty) this.saveData();
    }, 30000);
  }

  private saveData(): void {
    try {
      const toolsPath = path.join(this.registryDir, TOOLS_FILE);
      fs.writeFileSync(
        toolsPath,
        JSON.stringify(
          { updatedAt: new Date().toISOString(), tools: Array.from(this.tools.values()) },
          null,
          2
        ),
        "utf-8"
      );

      const usagePath = path.join(this.registryDir, USAGE_FILE);
      fs.writeFileSync(
        usagePath,
        JSON.stringify(
          { updatedAt: new Date().toISOString(), usage: this.usage.slice(-5000) },
          null,
          2
        ),
        "utf-8"
      );

      this.dirty = false;
    } catch (err) {
      console.warn("[ToolRegistry] Failed to save data:", err);
    }
  }

  private loadData(): void {
    try {
      const toolsPath = path.join(this.registryDir, TOOLS_FILE);
      if (fs.existsSync(toolsPath)) {
        const data = JSON.parse(fs.readFileSync(toolsPath, "utf-8"));
        for (const tool of data.tools || []) {
          this.tools.set(tool.id, tool);
        }
      }

      const usagePath = path.join(this.registryDir, USAGE_FILE);
      if (fs.existsSync(usagePath)) {
        const data = JSON.parse(fs.readFileSync(usagePath, "utf-8"));
        this.usage = data.usage || [];
      }

      console.log(`[ToolRegistry] Loaded ${this.tools.size} tools, ${this.usage.length} usage records`);
    } catch (err) {
      console.warn("[ToolRegistry] Failed to load data:", err);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveData();
    this.removeAllListeners();
  }
}
