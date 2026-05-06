/** Tool Registry type definitions. */

export type ToolCategory = "web" | "file" | "data" | "code" | "communication" | "search" | "analysis" | "media" | "system" | "custom";
export type ToolStatus = "available" | "deprecated" | "experimental" | "disabled";
export type ToolSource = "builtin" | "mcp" | "skill" | "plugin" | "custom";

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
  min?: number;
  max?: number;
  pattern?: string;
  default?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  parameters: ToolParameter[];
  examples?: string[];
  permissions?: string[];
  status: ToolStatus;
  source: ToolSource;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToolAnalytics {
  toolId: string;
  toolName: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageDurationMs: number;
  lastUsed: string;
  errorsByType?: Record<string, number>;
}

export interface ToolRegistryStats {
  totalTools: number;
  availableTools: number;
  deprecatedTools: number;
  experimentalTools: number;
  disabledTools: number;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}
