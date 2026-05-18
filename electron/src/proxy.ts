/**
 * DeerFlow Electron - Built-in Proxy Server
 *
 * Replaces nginx for the Electron desktop app.
 * Routes requests between the frontend and backend services:
 *   /api/langgraph/* → LangGraph (2024)
 *   /api/*           → Gateway (8001)
 *   /*               → Next.js Frontend (3000)
 */

import * as http from "http";
import { URL } from "url";

export interface ProxyConfig {
  port: number;
  langgraphPort: number;
  gatewayPort: number;
  frontendPort: number;
}

export class ProxyServer {
  private server: http.Server | null = null;
  private config: ProxyConfig;

  constructor(config: ProxyConfig) {
    this.config = config;
  }

  /**
   * Start the proxy server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.warn(
            `[Proxy] Port ${this.config.port} already in use, assuming external proxy exists`
          );
          resolve();
        } else {
          reject(err);
        }
      });

      this.server.listen(this.config.port, () => {
        console.log(
          `[Proxy] Listening on port ${this.config.port}`
        );
        resolve();
      });
    });
  }

  /**
   * Stop the proxy server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log("[Proxy] Server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle incoming HTTP requests and route them
   */
  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      this.setCORSHeaders(res);
      res.writeHead(204);
      res.end();
      return;
    }

    // Set CORS headers for all responses
    this.setCORSHeaders(res);

    const urlPath = req.url || "/";

    // Route: LangGraph API
    if (urlPath.startsWith("/api/langgraph/")) {
      // Strip /api/langgraph prefix before forwarding
      const targetPath = urlPath.replace("/api/langgraph", "");
      this.proxyRequest(
        req,
        res,
        this.config.langgraphPort,
        targetPath
      );
      return;
    }

    // Route: Gateway API endpoints
    if (
      urlPath.startsWith("/api/models") ||
      urlPath.startsWith("/api/memory") ||
      urlPath.startsWith("/api/mcp") ||
      urlPath.startsWith("/api/skills") ||
      urlPath.startsWith("/api/agents") ||
      urlPath.match(/^\/api\/threads/) ||
      urlPath.startsWith("/api/suggestions") ||
      urlPath.startsWith("/api/electron") ||
      urlPath.startsWith("/health")
    ) {
      this.proxyRequest(req, res, this.config.gatewayPort, urlPath);
      return;
    }

    // Route: API docs
    if (
      urlPath.startsWith("/docs") ||
      urlPath.startsWith("/redoc") ||
      urlPath === "/openapi.json"
    ) {
      this.proxyRequest(req, res, this.config.gatewayPort, urlPath);
      return;
    }

    // Route: Everything else → Frontend (Next.js)
    this.proxyRequest(req, res, this.config.frontendPort, urlPath);
  }

  /**
   * Proxy a request to a target port
   */
  private proxyRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    targetPort: number,
    targetPath: string
  ) {
    const targetHost = "127.0.0.1";
    const targetUrl = new URL(targetPath, `http://${targetHost}:${targetPort}`);

    // Preserve query string
    if (req.url?.includes("?")) {
      const queryString = req.url.split("?")[1];
      targetUrl.search = queryString;
    }

    const proxyHeaders: Record<string, string> = {
      host: `${targetHost}:${targetPort}`,
      "x-real-ip": req.socket.remoteAddress || "127.0.0.1",
      "x-forwarded-for":
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "127.0.0.1",
      "x-forwarded-proto": "http",
    };

    // Forward content-type and other important headers
    const forwardHeaders = [
      "content-type",
      "content-length",
      "accept",
      "accept-language",
      "accept-encoding",
      "authorization",
      "cookie",
      "user-agent",
      "referer",
      "origin",
    ];

    for (const header of forwardHeaders) {
      if (req.headers[header]) {
        proxyHeaders[header] = req.headers[header] as string;
      }
    }

    const proxyReq = http.request(
      {
        hostname: targetHost,
        port: targetPort,
        path: targetUrl.toString().replace(targetUrl.origin, ""),
        method: req.method,
        headers: proxyHeaders,
        timeout: 600000, // 10 minutes for long-running agent tasks
      },
      (proxyRes) => {
        // Stream the response back
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on("error", (err) => {
      console.error(
        `[Proxy] Error proxying to ${targetHost}:${targetPort}${targetPath}: ${err.message}`
      );
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Backend service unavailable",
            target: `${targetHost}:${targetPort}`,
            path: targetPath,
          })
        );
      }
    });

    proxyReq.on("timeout", () => {
      console.warn(
        `[Proxy] Timeout proxying to ${targetHost}:${targetPort}${targetPath}`
      );
      proxyReq.destroy();
    });

    // Stream the request body
    req.pipe(proxyReq, { end: true });
  }

  /**
   * Set CORS headers
   */
  private setCORSHeaders(res: http.ServerResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
}
