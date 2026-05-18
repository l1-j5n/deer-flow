import { getBackendBaseURL } from "@/core/config";

// ============================================================
// Types
// ============================================================

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  format?: string;
}

export interface ExportOptions {
  format: "json" | "markdown" | "html" | "pdf";
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  includeToolCalls?: boolean;
  includeThinking?: boolean;
  mediaHandling?: "embed" | "link" | "skip";
  mediaBase64Threshold?: number;
  compressMedia?: boolean;
  prettyPrint?: boolean;
  template?: string;
}

export interface ExportRecord {
  fileName: string;
  format: string;
  timestamp: string;
  size: number;
  sessionCount: number;
}

export interface ExportResponse {
  success: boolean;
  data?: string;
  filePath?: string;
  error?: string;
}

export interface ExportStats {
  totalExports: number;
  totalSize: number;
  formats: string[];
  templates: number;
}

// ============================================================
// API Functions (3-tier fallback)
// ============================================================

/**
 * Get available export templates.
 *
 * Priority: Backend → Electron IPC → Default templates
 */
export async function getTemplates(): Promise<ExportTemplate[]> {
  // 1. Try backend
  try {
    const url = `${getBackendBaseURL()}/api/session-export/templates`;
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as ExportTemplate[];
  } catch (err) {
    console.warn("Session export templates endpoint unreachable:", err);
  }

  // 2. Fallback: Electron IPC
  try {
    const api = window.electronAPI;
    if (api?.sessionExport) {
      return await api.sessionExport.getTemplates();
    }
  } catch (err) {
    console.warn("Session export IPC failed:", err);
  }

  // 3. Default templates
  return [
    { id: "default", name: "Default", description: "Standard export", icon: "file", format: "json" },
    { id: "minimal", name: "Minimal", description: "Messages only", icon: "file", format: "markdown" },
    { id: "detailed", name: "Detailed", description: "Full content", icon: "file", format: "json" },
    { id: "shareable", name: "Shareable", description: "Clean format", icon: "file", format: "markdown" },
  ];
}

/**
 * List export history.
 *
 * Priority: Backend → Electron IPC → Empty array
 */
export async function listExports(): Promise<ExportRecord[]> {
  // 1. Try backend
  try {
    const url = `${getBackendBaseURL()}/api/session-export/exports`;
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as ExportRecord[];
  } catch (err) {
    console.warn("Session export list endpoint unreachable:", err);
  }

  // 2. Fallback: Electron IPC
  try {
    const api = window.electronAPI;
    if (api?.sessionExport) {
      return await api.sessionExport.listExports();
    }
  } catch (err) {
    console.warn("Session export IPC failed:", err);
  }

  return [];
}

/**
 * Export a session.
 *
 * Priority: Backend → Electron IPC → Mock result
 */
export async function exportSession(
  sessionId: string,
  options?: ExportOptions,
): Promise<ExportResponse> {
  // 1. Try backend
  try {
    const url = `${getBackendBaseURL()}/api/session-export/export`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, options }),
    });
    if (res.ok) return (await res.json()) as ExportResponse;
  } catch (err) {
    console.warn("Session export endpoint unreachable:", err);
  }

  // 2. Fallback: Electron IPC
  try {
    const api = window.electronAPI;
    if (api?.sessionExport) {
      return await api.sessionExport.export(sessionId, options);
    }
  } catch (err) {
    console.warn("Session export IPC failed:", err);
  }

  // 3. Return mock success (for browser preview)
  return {
    success: true,
    filePath: `session_${Date.now()}.${options?.format || "json"}`,
  };
}

/**
 * Delete an export from history.
 */
export async function deleteExport(fileName: string): Promise<boolean> {
  // 1. Try backend
  try {
    const url = `${getBackendBaseURL()}/api/session-export/exports/${fileName}`;
    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) return true;
  } catch (err) {
    console.warn("Session export delete endpoint unreachable:", err);
  }

  // 2. Fallback: Electron IPC
  try {
    const api = window.electronAPI;
    if (api?.sessionExport) {
      return await api.sessionExport.deleteExport(fileName);
    }
  } catch (err) {
    console.warn("Session export IPC delete failed:", err);
  }

  return false;
}

/**
 * Get export statistics.
 */
export async function getExportStats(): Promise<ExportStats | null> {
  // 1. Try backend
  try {
    const url = `${getBackendBaseURL()}/api/session-export/stats`;
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as ExportStats;
  } catch (err) {
    console.warn("Session export stats endpoint unreachable:", err);
  }

  return null;
}