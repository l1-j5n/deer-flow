/**
 * DeerFlow Electron - Static File Server
 *
 * Serves the statically-exported Next.js frontend files.
 * Used in production mode when Next.js dev server is not available.
 * Falls back to index.html for client-side routing (SPA behavior).
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";

export interface StaticServerConfig {
  port: number;
  rootDir: string;
}

export class StaticServer {
  private server: http.Server | null = null;
  private config: StaticServerConfig;

  constructor(config: StaticServerConfig) {
    this.config = config;
  }

  /**
   * Start the static file server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.warn(
            `[StaticServer] Port ${this.config.port} already in use`
          );
          resolve();
        } else {
          reject(err);
        }
      });

      this.server.listen(this.config.port, () => {
        console.log(
          `[StaticServer] Serving static files from ${this.config.rootDir} on port ${this.config.port}`
        );
        resolve();
      });
    });
  }

  /**
   * Stop the static file server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log("[StaticServer] Server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle incoming HTTP requests
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Set CORS headers
    this.setCORSHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlPath = req.url || "/";
    // Remove query string for file lookup
    const cleanPath = urlPath.split("?")[0];

    // Security: prevent directory traversal
    const safePath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, "");
    let filePath = path.join(this.config.rootDir, safePath);

    // Default to index.html for directories (SPA fallback)
    if (safePath.endsWith("/") || !path.extname(safePath)) {
      // Try the path as an HTML file first (for trailingSlash export)
      const htmlPath = filePath + ".html";
      if (fs.existsSync(htmlPath)) {
        filePath = htmlPath;
      } else {
        // Fall back to index.html for client-side routing
        const indexPath = path.join(this.config.rootDir, "index.html");
        if (fs.existsSync(indexPath)) {
          filePath = indexPath;
        }
      }
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Try index.html in directory
      const indexPath = path.join(filePath, "index.html");
      if (fs.existsSync(indexPath)) {
        filePath = indexPath;
      } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = this.getContentType(ext);

    // Serve file
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on("error", (err) => {
      console.error(`[StaticServer] Error reading ${filePath}:`, err.message);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    });
  }

  /**
   * Set CORS headers
   */
  private setCORSHeaders(res: http.ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  /**
   * Get MIME type from file extension
   */
  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".mjs": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "font/otf",
      ".wasm": "application/wasm",
      ".map": "application/json",
    };
    return types[ext] || "application/octet-stream";
  }
}
