/**
 * DeerFlow Electron - MCP (Model Context Protocol) Tool Manager
 *
 * Manages MCP servers and tools for the agent platform:
 * - Discover and register MCP servers from config
 * - Maintain tool registry with metadata
 * - Handle tool execution via stdio/sse transports
 * - Support dynamic tool loading/unloading
 * - Tool capability introspection
 *
 * MCP is an open protocol for extending LLM capabilities with external tools.
 * This manager acts as the bridge between DeerFlow's agent system and MCP servers.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";

// ============================================================
// Type Definitions
// ============================================================

export interface MCPServerConfig {
  name: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string; // For SSE transport
  transport: "stdio" | "sse";
  enabled: boolean;
  timeout?: number;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  server: string;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
}

export interface MCPServerStatus {
  name: string;
  enabled: boolean;
  connected: boolean;
  transport: "stdio" | "sse";
  toolCount: number;
  lastError?: string;
  pid?: number;
}

export interface MCPRegistry {
  servers: MCPServerConfig[];
  tools: MCPTool[];
  version: number;
}

// ============================================================
// MCP Manager
// ============================================================

export class MCPManager extends EventEmitter {
  private projectRoot: string;
  private servers: Map<string, MCPServerConfig> = new Map();
  private tools: Map<string, MCPTool> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private serverTools: Map<string, Set<string>> = new Map(); // server -> tool names
  private requestId = 0;
  private pendingRequests: Map<
    number,
    { resolve: (value: any) => void; reject: (reason: any) => void; timer: NodeJS.Timeout }
  > = new Map();
  private registryVersion = 1;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  // ============================================================
  // Registry Management
  // ============================================================

  /**
   * Load MCP server configurations from config file
   */
  async loadConfig(): Promise<void> {
    const configPath = path.join(this.projectRoot, "mcp-config.json");

    try {
      if (!fs.existsSync(configPath)) {
        // Create default config if not exists
        this.createDefaultConfig(configPath);
        return;
      }

      const content = fs.readFileSync(configPath, "utf-8");
      const registry: MCPRegistry = JSON.parse(content);

      for (const server of registry.servers || []) {
        this.servers.set(server.name, server);
        this.serverTools.set(server.name, new Set());
      }

      for (const tool of registry.tools || []) {
        this.tools.set(tool.name, tool);
        const serverTools = this.serverTools.get(tool.server);
        if (serverTools) {
          serverTools.add(tool.name);
        }
      }

      this.registryVersion = registry.version || 1;
      this.emit("config-loaded", { serverCount: this.servers.size, toolCount: this.tools.size });
    } catch (err: any) {
      console.warn("[MCPManager] Failed to load config:", err.message);
      this.emit("config-error", err.message);
    }
  }

  /**
   * Save current registry to config file
   */
  saveConfig(): { success: boolean; error?: string } {
    try {
      const configPath = path.join(this.projectRoot, "mcp-config.json");
      const registry: MCPRegistry = {
        version: ++this.registryVersion,
        servers: Array.from(this.servers.values()),
        tools: Array.from(this.tools.values()),
      };

      fs.writeFileSync(configPath, JSON.stringify(registry, null, 2), "utf-8");
      this.emit("config-saved", { path: configPath });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Create default MCP config with common servers
   */
  private createDefaultConfig(configPath: string): void {
    const defaultRegistry: MCPRegistry = {
      version: 1,
      servers: [
        {
          name: "filesystem",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem", this.projectRoot],
          transport: "stdio",
          enabled: false,
          timeout: 30000,
        },
        {
          name: "fetch",
          command: "uvx",
          args: ["mcp-server-fetch"],
          transport: "stdio",
          enabled: false,
          timeout: 30000,
        },
      ],
      tools: [],
    };

    fs.writeFileSync(configPath, JSON.stringify(defaultRegistry, null, 2), "utf-8");
    this.emit("config-created", { path: configPath });
  }

  // ============================================================
  // Server Lifecycle
  // ============================================================

  /**
   * Start all enabled MCP servers
   */
  async startAll(): Promise<void> {
    const enabledServers = Array.from(this.servers.values()).filter((s) => s.enabled);
    console.log(`[MCPManager] Starting ${enabledServers.length} MCP servers...`);

    await Promise.allSettled(enabledServers.map((s) => this.startServer(s)));
  }

  /**
   * Start a single MCP server
   */
  async startServer(config: MCPServerConfig): Promise<{ success: boolean; error?: string }> {
    if (this.processes.has(config.name)) {
      return { success: false, error: `Server ${config.name} is already running` };
    }

    try {
      if (config.transport === "stdio") {
        return await this.startStdioServer(config);
      } else if (config.transport === "sse") {
        return await this.startSSEServer(config);
      }
      return { success: false, error: `Unknown transport: ${config.transport}` };
    } catch (err: any) {
      this.emit("server-error", config.name, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Start a stdio-based MCP server
   */
  private async startStdioServer(
    config: MCPServerConfig
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const env = {
        ...process.env,
        ...config.env,
      };

      const proc = spawn(config.command!, config.args || [], {
        env,
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.processes.set(config.name, proc);

      // Handle stdout for JSON-RPC responses
      let buffer = "";
      proc.stdout?.on("data", (data: Buffer) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            this.handleJsonRpcMessage(config.name, line);
          }
        }
      });

      proc.stderr?.on("data", (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) {
          console.log(`[MCP:${config.name}] ${msg}`);
          this.emit("server-log", config.name, "stderr", msg);
        }
      });

      proc.on("error", (err) => {
        console.error(`[MCPManager] Server ${config.name} error:`, err.message);
        this.emit("server-error", config.name, err.message);
        resolve({ success: false, error: err.message });
      });

      proc.on("exit", (code) => {
        console.log(`[MCPManager] Server ${config.name} exited with code ${code}`);
        this.processes.delete(config.name);
        this.emit("server-exit", config.name, code);
      });

      // Send initialize request
      setTimeout(async () => {
        try {
          await this.sendInitialize(config.name);
          await this.discoverTools(config.name);
          this.emit("server-ready", config.name);
          resolve({ success: true });
        } catch (err: any) {
          resolve({ success: false, error: err.message });
        }
      }, 500);
    });
  }

  /**
   * Start an SSE-based MCP server connection
   */
  private async startSSEServer(
    config: MCPServerConfig
  ): Promise<{ success: boolean; error?: string }> {
    // SSE transport implementation would go here
    // For now, mark as connected and emit ready
    this.emit("server-ready", config.name);
    return { success: true };
  }

  /**
   * Stop a single MCP server
   */
  async stopServer(name: string): Promise<void> {
    const proc = this.processes.get(name);
    if (proc) {
      proc.kill("SIGTERM");
      this.processes.delete(name);
    }

    // Remove tools associated with this server
    const toolNames = this.serverTools.get(name);
    if (toolNames) {
      for (const toolName of toolNames) {
        this.tools.delete(toolName);
      }
      this.serverTools.delete(name);
    }

    this.emit("server-stopped", name);
  }

  /**
   * Stop all MCP servers
   */
  async stopAll(): Promise<void> {
    for (const name of this.processes.keys()) {
      await this.stopServer(name);
    }
  }

  // ============================================================
  // JSON-RPC Communication
  // ============================================================

  /**
   * Send JSON-RPC request to a server
   */
  private sendRequest(serverName: string, method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const proc = this.processes.get(serverName);
      if (!proc || !proc.stdin) {
        reject(new Error(`Server ${serverName} is not running`));
        return;
      }

      const id = ++this.requestId;
      const request = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      const timeout = this.servers.get(serverName)?.timeout || 30000;
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      this.pendingRequests.set(id, { resolve, reject, timer });

      const message = JSON.stringify(request) + "\n";
      proc.stdin.write(message, (err) => {
        if (err) {
          clearTimeout(timer);
          this.pendingRequests.delete(id);
          reject(err);
        }
      });
    });
  }

  /**
   * Handle incoming JSON-RPC message
   */
  private handleJsonRpcMessage(serverName: string, line: string): void {
    try {
      const message = JSON.parse(line);

      if (message.id !== undefined && this.pendingRequests.has(message.id)) {
        const pending = this.pendingRequests.get(message.id)!;
        clearTimeout(pending.timer);
        this.pendingRequests.delete(message.id);

        if (message.error) {
          pending.reject(new Error(message.error.message || "Unknown error"));
        } else {
          pending.resolve(message.result);
        }
      }

      if (message.method === "notifications/tools/list_changed") {
        this.discoverTools(serverName);
      }
    } catch {
      // Not valid JSON-RPC, might be log output
    }
  }

  /**
   * Send initialize request to server
   */
  private async sendInitialize(serverName: string): Promise<void> {
    await this.sendRequest(serverName, "initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "deerflow-electron", version: "0.5.0" },
    });
  }

  /**
   * Discover tools from a server
   */
  private async discoverTools(serverName: string): Promise<void> {
    try {
      const result = await this.sendRequest(serverName, "tools/list");
      const tools = result?.tools || [];

      // Clear old tools for this server
      const oldTools = this.serverTools.get(serverName);
      if (oldTools) {
        for (const toolName of oldTools) {
          this.tools.delete(toolName);
        }
        oldTools.clear();
      }

      // Register new tools
      for (const tool of tools) {
        const toolDef: MCPTool = {
          name: tool.name,
          description: tool.description || "",
          inputSchema: tool.inputSchema || {},
          server: serverName,
        };

        this.tools.set(tool.name, toolDef);
        oldTools?.add(tool.name);
      }

      this.emit("tools-discovered", serverName, tools.length);
    } catch (err: any) {
      console.warn(`[MCPManager] Failed to discover tools from ${serverName}:`, err.message);
    }
  }

  // ============================================================
  // Tool Execution
  // ============================================================

  /**
   * Execute a tool by name with given arguments
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<MCPToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolName}" not found`,
        executionTime: 0,
      };
    }

    const startTime = Date.now();

    try {
      const result = await this.sendRequest(tool.server, "tools/call", {
        name: toolName,
        arguments: args,
      });

      const executionTime = Date.now() - startTime;

      this.emit("tool-executed", toolName, executionTime);

      return {
        success: true,
        data: result,
        executionTime,
      };
    } catch (err: any) {
      const executionTime = Date.now() - startTime;

      this.emit("tool-error", toolName, err.message);

      return {
        success: false,
        error: err.message,
        executionTime,
      };
    }
  }

  /**
   * Validate tool arguments against schema
   */
  validateToolArgs(toolName: string, args: Record<string, any>): { valid: boolean; errors?: string[] } {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { valid: false, errors: [`Tool "${toolName}" not found`] };
    }

    const schema = tool.inputSchema;
    const errors: string[] = [];
    const required = schema.required || [];

    for (const key of required) {
      if (args[key] === undefined || args[key] === null) {
        errors.push(`Missing required argument: ${key}`);
      }
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  }

  // ============================================================
  // Server Configuration
  // ============================================================

  /**
   * Add a new MCP server
   */
  addServer(config: MCPServerConfig): { success: boolean; error?: string } {
    if (this.servers.has(config.name)) {
      return { success: false, error: `Server "${config.name}" already exists` };
    }

    this.servers.set(config.name, config);
    this.serverTools.set(config.name, new Set());
    this.saveConfig();

    this.emit("server-added", config.name);
    return { success: true };
  }

  /**
   * Remove an MCP server
   */
  async removeServer(name: string): Promise<{ success: boolean; error?: string }> {
    await this.stopServer(name);
    this.servers.delete(name);
    this.saveConfig();

    this.emit("server-removed", name);
    return { success: true };
  }

  /**
   * Enable/disable a server
   */
  async setServerEnabled(name: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
    const server = this.servers.get(name);
    if (!server) {
      return { success: false, error: `Server "${name}" not found` };
    }

    server.enabled = enabled;

    if (enabled && !this.processes.has(name)) {
      const result = await this.startServer(server);
      if (!result.success) {
        server.enabled = false;
        return result;
      }
    } else if (!enabled && this.processes.has(name)) {
      await this.stopServer(name);
    }

    this.saveConfig();
    this.emit("server-enabled-changed", name, enabled);
    return { success: true };
  }

  // ============================================================
  // Queries
  // ============================================================

  /**
   * Get all registered tools
   */
  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools for a specific server
   */
  getToolsByServer(serverName: string): MCPTool[] {
    const toolNames = this.serverTools.get(serverName);
    if (!toolNames) return [];

    return Array.from(toolNames)
      .map((name) => this.tools.get(name))
      .filter(Boolean) as MCPTool[];
  }

  /**
   * Get a single tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all server statuses
   */
  getServerStatuses(): MCPServerStatus[] {
    return Array.from(this.servers.values()).map((config) => {
      const isRunning = this.processes.has(config.name);
      const toolNames = this.serverTools.get(config.name);

      return {
        name: config.name,
        enabled: config.enabled,
        connected: isRunning,
        transport: config.transport,
        toolCount: toolNames?.size || 0,
        pid: isRunning ? this.processes.get(config.name)?.pid : undefined,
      };
    });
  }

  /**
   * Get server config
   */
  getServerConfig(name: string): MCPServerConfig | undefined {
    return this.servers.get(name);
  }

  /**
   * Get total tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Get total server count
   */
  getServerCount(): number {
    return this.servers.size;
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Search tools by keyword
   */
  searchTools(query: string): MCPTool[] {
    const lower = query.toLowerCase();
    return this.getAllTools().filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower)
    );
  }
}
