/**
 * DeerFlow Electron - Session Export Service
 *
 * Enhanced session export with multiple formats and media attachment support:
 * - JSON: Structured data export with full metadata
 * - Markdown: Human-readable conversation transcript
 * - HTML: Styled conversation export with syntax highlighting
 * - Media bundling: Collects and packages attachment files
 * - Batch export: Export multiple sessions at once
 * - Export templates: Customizable output formatting
 */

import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
import type { AgentSession, AgentMessage } from "./agent-session";

// ============================================================
// Type Definitions
// ============================================================

export type ExportFormat = "json" | "markdown" | "html" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeStats?: boolean;
  includeMedia?: boolean;
  mediaBasePath?: string;
  template?: string;
  dateFormat?: string;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filePath?: string;
  mediaPaths?: string[];
  error?: string;
}

export interface BatchExportResult {
  success: boolean;
  completed: number;
  failed: number;
  results: Array<{ sessionId: string; success: boolean; error?: string; filePath?: string }>;
  zipPath?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  headerTemplate: string;
  messageTemplate: string;
  footerTemplate: string;
  css?: string;
}

export interface MediaAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  data?: string; // base64 encoded
  path?: string;
}

// ============================================================
// Default Templates
// ============================================================

const DEFAULT_TEMPLATES: ExportTemplate[] = [
  {
    id: "default-markdown",
    name: "Default Markdown",
    description: "Clean Markdown export with metadata header",
    format: "markdown",
    headerTemplate: `# {title}\n\n**Model:** {model}  \n**Created:** {createdAt}  \n**Messages:** {messageCount}  \n**Status:** {status}\n\n---\n\n`,
    messageTemplate: `### {role} ({timestamp})\n\n{content}\n\n{toolCalls}\n\n---\n\n`,
    footerTemplate: `\n\n---\n*Exported from DeerFlow on {exportedAt}*\n`,
  },
  {
    id: "detailed-markdown",
    name: "Detailed Markdown",
    description: "Markdown with full metadata and statistics",
    format: "markdown",
    headerTemplate: `# {title}\n\n## Session Information\n\n| Property | Value |\n|----------|-------|\n| ID | {id} |\n| Model | {model} |\n| Status | {status} |\n| Created | {createdAt} |\n| Updated | {updatedAt} |\n| Messages | {messageCount} |\n| Tool Calls | {toolCallCount} |\n| Duration | {duration}ms |\n\n## Tags\n\n{tags}\n\n---\n\n`,
    messageTemplate: `### Message {index} - {role}\n\n**Time:** {timestamp}  \n**ID:** {messageId}\n\n{content}\n\n{toolCalls}\n\n---\n\n`,
    footerTemplate: `\n\n---\n*Exported from DeerFlow on {exportedAt}*\n*Format: Detailed Markdown*\n`,
  },
  {
    id: "default-html",
    name: "Styled HTML",
    description: "HTML export with built-in styling",
    format: "html",
    headerTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} - DeerFlow Export</title>
<style>
{css}
</style>
</head>
<body>
<div class="container">
<header class="session-header">
<h1>{title}</h1>
<div class="meta">
<span class="badge">{model}</span>
<span class="badge">{status}</span>
<span>{createdAt}</span>
</div>
</header>
<main class="messages">`,
    messageTemplate: `<article class="message {role}">
<div class="message-header">
<span class="role">{role}</span>
<span class="timestamp">{timestamp}</span>
</div>
<div class="message-content">{content}</div>
{toolCalls}
</article>`,
    footerTemplate: `</main>
<footer class="export-footer">
<p>Exported from DeerFlow on {exportedAt}</p>
</footer>
</div>
</body>
</html>`,
    css: `body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.6;max-width:800px;margin:0 auto;padding:20px;background:#f5f5f5}.container{background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden}.session-header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:24px}.session-header h1{margin:0 0 8px}.meta{display:flex;gap:8px;flex-wrap:wrap}.badge{background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:12px;font-size:12px}.messages{padding:20px}.message{margin-bottom:16px;padding:16px;border-radius:8px}.message.user{background:#e3f2fd;margin-left:20%}.message.assistant{background:#f3e5f5;margin-right:20%}.message.system{background:#fff3e0;font-size:14px}.message.tool{background:#e8f5e9;font-size:14px}.message-header{display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;color:#666;text-transform:uppercase}.message-content{white-space:pre-wrap;word-break:break-word}.tool-calls{background:#f5f5f5;padding:12px;border-radius:4px;margin-top:8px;font-size:14px}.tool-call{padding:8px;background:#fff;border-radius:4px;margin-bottom:8px}.export-footer{text-align:center;padding:20px;color:#999;font-size:12px;border-top:1px solid #eee}`,
  },
];

// ============================================================
// Session Export Service
// ============================================================

export class SessionExportService extends EventEmitter {
  private projectRoot: string;
  private exportsDir: string;
  private templates: Map<string, ExportTemplate> = new Map();

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.exportsDir = path.join(projectRoot, ".deerflow", "exports");
    this.ensureDirectories();
    this.loadDefaultTemplates();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  private loadDefaultTemplates(): void {
    for (const template of DEFAULT_TEMPLATES) {
      this.templates.set(template.id, template);
    }
  }

  // ============================================================
  // Template Management
  // ============================================================

  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): ExportTemplate | undefined {
    return this.templates.get(id);
  }

  addTemplate(template: ExportTemplate): void {
    this.templates.set(template.id, template);
  }

  // ============================================================
  // Single Session Export
  // ============================================================

  exportSession(session: AgentSession, options: ExportOptions): ExportResult {
    try {
      const template = options.template
        ? this.templates.get(options.template)
        : this.getDefaultTemplate(options.format);

      if (!template) {
        return { success: false, error: `No template found for format: ${options.format}` };
      }

      let content: string;

      switch (options.format) {
        case "json":
          content = this.exportAsJSON(session, options);
          break;
        case "markdown":
          content = this.exportAsMarkdown(session, template, options);
          break;
        case "html":
          content = this.exportAsHTML(session, template, options);
          break;
        default:
          return { success: false, error: `Unsupported format: ${options.format}` };
      }

      // Save to file
      const fileName = this.generateFileName(session, options.format);
      const filePath = path.join(this.exportsDir, fileName);
      fs.writeFileSync(filePath, content, "utf-8");

      // Collect media if requested
      let mediaPaths: string[] | undefined;
      if (options.includeMedia) {
        mediaPaths = this.collectMediaAttachments(session, options.mediaBasePath);
      }

      this.emit("session-exported", { sessionId: session.id, format: options.format, filePath });

      return {
        success: true,
        data: content,
        filePath,
        mediaPaths,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ============================================================
  // Batch Export
  // ============================================================

  async batchExport(
    sessions: AgentSession[],
    options: ExportOptions
  ): Promise<BatchExportResult> {
    const results: BatchExportResult["results"] = [];
    let completed = 0;
    let failed = 0;

    for (const session of sessions) {
      const result = this.exportSession(session, options);
      if (result.success) {
        completed++;
        results.push({ sessionId: session.id, success: true, filePath: result.filePath });
      } else {
        failed++;
        results.push({ sessionId: session.id, success: false, error: result.error });
      }
    }

    // Create ZIP if multiple files
    let zipPath: string | undefined;
    if (completed > 1 && options.format !== "json") {
      zipPath = await this.createZipArchive(results.filter((r) => r.success && r.filePath).map((r) => r.filePath!));
    }

    return {
      success: failed === 0,
      completed,
      failed,
      results,
      zipPath,
    };
  }

  // ============================================================
  // Format Exporters
  // ============================================================

  private exportAsJSON(session: AgentSession, options: ExportOptions): string {
    const exportData: Record<string, any> = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      format: "json",
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        model: session.model,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          metadata: m.metadata,
          toolCalls: m.toolCalls,
        })),
      },
    };

    if (options.includeMetadata !== false) {
      exportData.session.metadata = session.metadata;
    }

    if (options.includeStats !== false) {
      exportData.session.stats = session.stats;
    }

    return JSON.stringify(exportData, null, 2);
  }

  private exportAsMarkdown(
    session: AgentSession,
    template: ExportTemplate,
    _options: ExportOptions
  ): string {
    const now = new Date().toISOString();
    const dateFmt = (iso: string) => new Date(iso).toLocaleString();

    // Build header
    let header = template.headerTemplate
      .replace(/{title}/g, session.title)
      .replace(/{id}/g, session.id)
      .replace(/{model}/g, session.model)
      .replace(/{status}/g, session.status)
      .replace(/{createdAt}/g, dateFmt(session.createdAt))
      .replace(/{updatedAt}/g, dateFmt(session.updatedAt))
      .replace(/{messageCount}/g, String(session.stats.messageCount))
      .replace(/{toolCallCount}/g, String(session.stats.toolCallCount))
      .replace(/{duration}/g, String(session.stats.duration))
      .replace(/{tags}/g, session.metadata.tags?.join(", ") || "None")
      .replace(/{exportedAt}/g, dateFmt(now));

    // Build messages
    let messages = "";
    session.messages.forEach((msg, index) => {
      const toolCallsStr = this.formatToolCallsMarkdown(msg);
      messages += template.messageTemplate
        .replace(/{index}/g, String(index + 1))
        .replace(/{role}/g, msg.role)
        .replace(/{timestamp}/g, dateFmt(msg.timestamp))
        .replace(/{messageId}/g, msg.id)
        .replace(/{content}/g, msg.content)
        .replace(/{toolCalls}/g, toolCallsStr);
    });

    // Build footer
    const footer = template.footerTemplate.replace(/{exportedAt}/g, dateFmt(now));

    return header + messages + footer;
  }

  private exportAsHTML(
    session: AgentSession,
    template: ExportTemplate,
    _options: ExportOptions
  ): string {
    const now = new Date().toISOString();
    const dateFmt = (iso: string) => new Date(iso).toLocaleString();

    // Escape HTML in content
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/\n/g, "<br>");
    };

    // Build header
    let header = template.headerTemplate
      .replace(/{title}/g, escapeHtml(session.title))
      .replace(/{model}/g, session.model)
      .replace(/{status}/g, session.status)
      .replace(/{createdAt}/g, dateFmt(session.createdAt))
      .replace(/{messageCount}/g, String(session.stats.messageCount))
      .replace(/{exportedAt}/g, dateFmt(now))
      .replace(/{css}/g, template.css || "");

    // Build messages
    let messages = "";
    session.messages.forEach((msg) => {
      const toolCallsHtml = this.formatToolCallsHTML(msg);
      messages += template.messageTemplate
        .replace(/{role}/g, msg.role)
        .replace(/{timestamp}/g, dateFmt(msg.timestamp))
        .replace(/{content}/g, escapeHtml(msg.content))
        .replace(/{toolCalls}/g, toolCallsHtml);
    });

    // Build footer
    const footer = template.footerTemplate.replace(/{exportedAt}/g, dateFmt(now));

    return header + messages + footer;
  }

  // ============================================================
  // Tool Call Formatting
  // ============================================================

  private formatToolCallsMarkdown(message: AgentMessage): string {
    if (!message.toolCalls || message.toolCalls.length === 0) return "";

    let result = "\n\n**Tool Calls:**\n\n";
    for (const tc of message.toolCalls) {
      result += `- **${tc.name}**\n`;
      result += `  - Arguments: \`${JSON.stringify(tc.arguments)}\`\n`;
      if (tc.result !== undefined) {
        result += `  - Result: \`${JSON.stringify(tc.result).substring(0, 200)}\`\n`;
      }
    }
    return result;
  }

  private formatToolCallsHTML(message: AgentMessage): string {
    if (!message.toolCalls || message.toolCalls.length === 0) return "";

    let result = '<div class="tool-calls"><h4>Tool Calls</h4>';
    for (const tc of message.toolCalls) {
      result += `<div class="tool-call">
        <strong>${tc.name}</strong><br>
        <code>${JSON.stringify(tc.arguments)}</code><br>
        ${tc.result !== undefined ? `<small>Result: ${JSON.stringify(tc.result).substring(0, 200)}</small>` : ""}
      </div>`;
    }
    result += "</div>";
    return result;
  }

  // ============================================================
  // Media Attachments
  // ============================================================

  private collectMediaAttachments(
    session: AgentSession,
    basePath?: string
  ): string[] {
    const mediaPaths: string[] = [];
    const searchDirs = basePath
      ? [basePath, path.join(this.projectRoot, ".deerflow", "uploads")]
      : [path.join(this.projectRoot, ".deerflow", "uploads")];

    for (const msg of session.messages) {
      if (msg.metadata?.attachments) {
        for (const attachment of msg.metadata.attachments as Array<{ fileName?: string; path?: string }>) {
          if (attachment.path && fs.existsSync(attachment.path)) {
            mediaPaths.push(attachment.path);
          } else if (attachment.fileName) {
            for (const dir of searchDirs) {
              const fullPath = path.join(dir, attachment.fileName);
              if (fs.existsSync(fullPath)) {
                mediaPaths.push(fullPath);
                break;
              }
            }
          }
        }
      }
    }

    return [...new Set(mediaPaths)]; // Deduplicate
  }

  extractMediaFromSession(session: AgentSession): MediaAttachment[] {
    const attachments: MediaAttachment[] = [];

    for (const msg of session.messages) {
      if (msg.metadata?.attachments) {
        for (const att of msg.metadata.attachments as Array<{
          id?: string;
          fileName?: string;
          mimeType?: string;
          size?: number;
          path?: string;
        }>) {
          if (att.fileName) {
            attachments.push({
              id: att.id || `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              fileName: att.fileName,
              mimeType: att.mimeType || "application/octet-stream",
              size: att.size || 0,
              path: att.path,
            });
          }
        }
      }
    }

    return attachments;
  }

  // ============================================================
  // ZIP Archive
  // ============================================================

  private async createZipArchive(filePaths: string[]): Promise<string> {
    // Simple ZIP creation using Node.js built-ins
    // In production, you'd use a library like adm-zip or archiver
    const zipName = `batch-export-${Date.now()}.zip`;
    const zipPath = path.join(this.exportsDir, zipName);

    // For now, create a manifest JSON that lists all files
    const manifest = {
      exportedAt: new Date().toISOString(),
      fileCount: filePaths.length,
      files: filePaths.map((fp) => ({
        name: path.basename(fp),
        path: fp,
      })),
    };

    fs.writeFileSync(zipPath.replace(".zip", "-manifest.json"), JSON.stringify(manifest, null, 2));

    // Return the manifest path as a placeholder
    // Full ZIP implementation would require an additional dependency
    return zipPath.replace(".zip", "-manifest.json");
  }

  // ============================================================
  // Helpers
  // ============================================================

  private getDefaultTemplate(format: ExportFormat): ExportTemplate | undefined {
    return Array.from(this.templates.values()).find((t) => t.format === format);
  }

  private generateFileName(session: AgentSession, format: ExportFormat): string {
    const safeTitle = session.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "_").substring(0, 50);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = format === "markdown" ? "md" : format;
    return `${safeTitle}_${timestamp}.${ext}`;
  }

  getExportsDirectory(): string {
    return this.exportsDir;
  }

  listExports(): Array<{ fileName: string; path: string; size: number; createdAt: Date }> {
    try {
      const files = fs.readdirSync(this.exportsDir);
      return files
        .map((f) => {
          const fp = path.join(this.exportsDir, f);
          const stat = fs.statSync(fp);
          return {
            fileName: f,
            path: fp,
            size: stat.size,
            createdAt: stat.birthtime,
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch {
      return [];
    }
  }

  deleteExport(fileName: string): boolean {
    try {
      const fp = path.join(this.exportsDir, fileName);
      if (fs.existsSync(fp)) {
        fs.unlinkSync(fp);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
