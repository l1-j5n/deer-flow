/**
 * DeerFlow Electron - File Drop Handler
 *
 * Enables drag-and-drop file support in the Electron window.
 * When files are dropped, they are forwarded to the renderer process
 * via IPC, allowing the frontend to handle file uploads to agent threads.
 *
 * Supports:
 * - Single and multi-file drops
 * - File metadata (name, size, path, type)
 * - Integration with DeerFlow's existing upload API
 */

import * as fs from "fs";
import * as path from "path";

export interface DroppedFile {
  name: string;
  path: string;
  size: number;
  type: string; // MIME type or extension-based
  isDirectory: boolean;
}

export class FileDropHandler {
  private projectRoot: string;
  private maxFileSize: number = 50 * 1024 * 1024; // 50MB default

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Process a list of dropped file paths
   */
  processDroppedFiles(filePaths: string[]): {
    files: DroppedFile[];
    errors: Array<{ path: string; error: string }>;
  } {
    const files: DroppedFile[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    for (const filePath of filePaths) {
      try {
        const stat = fs.statSync(filePath);

        if (stat.size > this.maxFileSize) {
          errors.push({
            path: filePath,
            error: `File too large (${this.formatSize(stat.size)}). Maximum: ${this.formatSize(this.maxFileSize)}`,
          });
          continue;
        }

        files.push({
          name: path.basename(filePath),
          path: filePath,
          size: stat.size,
          type: this.getMimeType(filePath),
          isDirectory: stat.isDirectory(),
        });
      } catch (err: any) {
        errors.push({
          path: filePath,
          error: err.message,
        });
      }
    }

    return { files, errors };
  }

  /**
   * Read a file as base64 for upload
   */
  readFileAsBase64(filePath: string): {
    success: boolean;
    data?: string;
    mimeType?: string;
    error?: string;
  } {
    try {
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString("base64");
      const mimeType = this.getMimeType(filePath);

      return {
        success: true,
        data: base64,
        mimeType,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Copy a dropped file to a thread's upload directory
   */
  copyToThreadUpload(
    filePath: string,
    threadId: string
  ): { success: boolean; destination?: string; error?: string } {
    try {
      const uploadDir = path.join(
        this.projectRoot,
        "backend",
        "threads",
        threadId,
        "uploads"
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = path.basename(filePath);
      const destPath = path.join(uploadDir, fileName);

      // Handle name collision
      let finalDestPath = destPath;
      let counter = 1;
      while (fs.existsSync(finalDestPath)) {
        const ext = path.extname(fileName);
        const base = path.basename(fileName, ext);
        finalDestPath = path.join(uploadDir, `${base}_${counter}${ext}`);
        counter++;
      }

      fs.copyFileSync(filePath, finalDestPath);

      return {
        success: true,
        destination: finalDestPath,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    const mimeMap: Record<string, string> = {
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".json": "application/json",
      ".yaml": "text/yaml",
      ".yml": "text/yaml",
      ".csv": "text/csv",
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".ts": "text/typescript",
      ".py": "text/x-python",
      ".pdf": "application/pdf",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".ico": "image/x-icon",
      ".zip": "application/zip",
      ".tar": "application/x-tar",
      ".gz": "application/gzip",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".avi": "video/x-msvideo",
    };

    return mimeMap[ext] || "application/octet-stream";
  }

  /**
   * Format file size for display
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
}
