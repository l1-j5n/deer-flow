/**
 * DeerFlow Electron - Agent Bridge
 *
 * Bridges the Electron main process with the DeerFlow backend LangGraph agent:
 * - Direct API calls to LangGraph server (localhost:2024)
 * - Stream handling for agent responses (SSE/WebSocket)
 * - Message format conversion (Electron ↔ LangGraph protocol)
 * - Session state synchronization
 * - Tool result submission back to agent
 * - Error handling and retry logic
 *
 * Acts as a high-level client for the agent backend,
 * abstracting the HTTP/SSE complexity from other modules.
 */

import { EventEmitter } from "events";
import * as http from "http";

// ============================================================
// Type Definitions
// ============================================================

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
    toolCalls?: ToolCall[];
    toolResults?: ToolResult[];
  };
  timestamp: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  content: string;
  isError?: boolean;
}

export interface AgentStreamEvent {
  type: "message" | "token" | "tool_call" | "tool_result" | "error" | "done";
  data: any;
  timestamp: string;
}

export interface AgentThread {
  threadId: string;
  messages: AgentMessage[];
  status: "idle" | "running" | "error";
  model?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  langgraphUrl: string;
  defaultModel: string;
  timeoutMs: number;
  maxRetries: number;
  streamEnabled: boolean;
}

// ============================================================
// Agent Bridge
// ============================================================

const DEFAULT_CONFIG: AgentConfig = {
  langgraphUrl: "http://localhost:2024",
  defaultModel: "gpt-4o",
  timeoutMs: 120000,
  maxRetries: 3,
  streamEnabled: true,
};

export class AgentBridge extends EventEmitter {
  private config: AgentConfig;
  private activeStreams: Map<string, AbortController> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================================
  // Thread Management
  // ============================================================

  /**
   * Create a new agent thread
   */
  async createThread(model?: string): Promise<{ threadId: string } | null> {
    try {
      const response = await this.post("/threads", { model: model || this.config.defaultModel });
      return response;
    } catch (err: any) {
      this.emit("error", { action: "createThread", error: err.message });
      return null;
    }
  }

  /**
   * Get thread messages
   */
  async getThread(threadId: string): Promise<AgentThread | null> {
    try {
      const response = await this.get(`/threads/${threadId}`);
      return this.convertToAgentThread(response);
    } catch (err: any) {
      this.emit("error", { action: "getThread", threadId, error: err.message });
      return null;
    }
  }

  /**
   * Send a message to the agent and get response (non-streaming)
   */
  async sendMessage(threadId: string, content: string, options?: { model?: string }): Promise<AgentMessage | null> {
    try {
      const response = await this.post(`/threads/${threadId}/messages`, {
        content,
        model: options?.model || this.config.defaultModel,
      });
      return this.convertToAgentMessage(response);
    } catch (err: any) {
      this.emit("error", { action: "sendMessage", threadId, error: err.message });
      return null;
    }
  }

  /**
   * Send a message and stream the response
   */
  async streamMessage(
    threadId: string,
    content: string,
    options?: { model?: string },
    onEvent?: (event: AgentStreamEvent) => void
  ): Promise<void> {
    const abortController = new AbortController();
    this.activeStreams.set(threadId, abortController);

    try {
      const response = await fetch(`${this.config.langgraphUrl}/threads/${threadId}/messages/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          model: options?.model || this.config.defaultModel,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const event: AgentStreamEvent = {
                type: this.inferEventType(parsed),
                data: parsed,
                timestamp: new Date().toISOString(),
              };
              onEvent?.(event);
              this.emit("stream:event", event);
            } catch {
              // Skip non-JSON data
            }
          }
        }
      }

      onEvent?.({
        type: "done",
        data: {},
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      if (err.name === "AbortError") {
        onEvent?.({
          type: "error",
          data: { message: "Stream aborted" },
          timestamp: new Date().toISOString(),
        });
      } else {
        onEvent?.({
          type: "error",
          data: { message: err.message },
          timestamp: new Date().toISOString(),
        });
        this.emit("error", { action: "streamMessage", threadId, error: err.message });
      }
    } finally {
      this.activeStreams.delete(threadId);
    }
  }

  /**
   * Submit tool result back to agent
   */
  async submitToolResult(threadId: string, toolCallId: string, result: string, isError: boolean = false): Promise<boolean> {
    try {
      await this.post(`/threads/${threadId}/tool-results`, {
        toolCallId,
        result,
        isError,
      });
      return true;
    } catch (err: any) {
      this.emit("error", { action: "submitToolResult", threadId, toolCallId, error: err.message });
      return false;
    }
  }

  /**
   * Cancel an active stream
   */
  cancelStream(threadId: string): boolean {
    const controller = this.activeStreams.get(threadId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(threadId);
      return true;
    }
    return false;
  }

  // ============================================================
  // Health & Status
  // ============================================================

  /**
   * Check if LangGraph server is reachable
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.get("/ok", 5000);
      return !!response;
    } catch {
      return false;
    }
  }

  /**
   * Get available models from backend
   */
  async getAvailableModels(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.get("/models");
      return response?.models || [];
    } catch {
      return [];
    }
  }

  // ============================================================
  // HTTP Helpers
  // ============================================================

  private async get(path: string, timeoutMs?: number): Promise<any> {
    return this.request("GET", path, undefined, timeoutMs);
  }

  private async post(path: string, body: any, timeoutMs?: number): Promise<any> {
    return this.request("POST", path, body, timeoutMs);
  }

  private async request(method: string, path: string, body?: any, timeoutMs?: number): Promise<any> {
    const url = `${this.config.langgraphUrl}${path}`;
    const timeout = timeoutMs || this.config.timeoutMs;

    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options: http.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout,
      };

      if (body) {
        const bodyStr = JSON.stringify(body);
        options.headers!["Content-Length"] = Buffer.byteLength(bodyStr);
      }

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : null);
            } catch {
              resolve(data);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  // ============================================================
  // Converters
  // ============================================================

  private convertToAgentThread(data: any): AgentThread {
    return {
      threadId: data.thread_id || data.id,
      messages: (data.messages || []).map((m: any) => this.convertToAgentMessage(m)),
      status: data.status || "idle",
      model: data.model,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  }

  private convertToAgentMessage(data: any): AgentMessage {
    return {
      id: data.id || `msg-${Date.now()}`,
      role: data.role || "assistant",
      content: data.content || "",
      metadata: {
        model: data.model,
        tokens: data.tokens,
        latency: data.latency,
        toolCalls: data.tool_calls,
        toolResults: data.tool_results,
      },
      timestamp: data.timestamp || new Date().toISOString(),
    };
  }

  private inferEventType(data: any): AgentStreamEvent["type"] {
    if (data.type === "token" || data.delta) return "token";
    if (data.type === "tool_call" || data.tool_calls) return "tool_call";
    if (data.type === "tool_result" || data.tool_results) return "tool_result";
    if (data.type === "error" || data.error) return "error";
    if (data.type === "done" || data.finished) return "done";
    return "message";
  }

  // ============================================================
  // Configuration
  // ============================================================

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit("config:updated", this.config);
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    // Cancel all active streams
    for (const [threadId, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
    this.removeAllListeners();
  }
}
