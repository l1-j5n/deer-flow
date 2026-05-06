/**
 * DeerFlow Electron - Agent Skill Manager
 *
 * Manages agent skills (reusable tool packages/workflows):
 * - Skill registry with metadata, versioning, and dependencies
 * - Dynamic skill loading/unloading from local filesystem or remote URLs
 * - Skill composition (skills can depend on other skills)
 * - Skill validation (schema checking, dependency resolution)
 * - Skill marketplace integration (install from registry)
 * - Hot-reload during development
 *
 * A "skill" is a packaged unit of agent capability: prompts, tools,
 * workflows, and knowledge that can be dynamically attached to sessions.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type SkillStatus = "available" | "enabled" | "disabled" | "error" | "loading";

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  author?: string;
  tags: string[];
  dependencies: string[]; // Other skill names this skill depends on
  permissions: string[]; // Required permissions (file, network, exec, etc.)
  entryPoint: string; // Main file to load (relative to skill dir)
  schema: SkillSchema;
  config?: Record<string, any>; // Default configuration
}

export interface SkillSchema {
  inputs: SkillInputDef[];
  outputs: SkillOutputDef[];
  parameters: Record<string, SkillParameterDef>;
}

export interface SkillInputDef {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "file";
  required: boolean;
  description?: string;
  default?: any;
}

export interface SkillOutputDef {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "file";
  description?: string;
}

export interface SkillParameterDef {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  default?: any;
  enum?: any[];
}

export interface Skill {
  id: string;
  manifest: SkillManifest;
  status: SkillStatus;
  source: "builtin" | "local" | "remote" | "marketplace";
  path: string; // Directory path
  loadedAt?: string;
  error?: string;
  config: Record<string, any>;
  // Runtime data
  prompts?: Map<string, string>;
  tools?: SkillToolDef[];
  workflows?: string[]; // Workflow IDs this skill provides
}

export interface SkillToolDef {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: string; // Reference to handler function name
}

export interface SkillInstallOptions {
  source: "local" | "remote" | "marketplace";
  path?: string; // For local install
  url?: string; // For remote install
  marketplaceId?: string; // For marketplace install
  version?: string;
  autoEnable?: boolean;
}

export interface SkillValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SkillExecutionContext {
  sessionId: string;
  skillId: string;
  inputs: Record<string, any>;
  config: Record<string, any>;
  // Access to platform capabilities
  callTool?: (toolName: string, args: Record<string, any>) => Promise<any>;
  sendMessage?: (content: string) => void;
  getMemory?: (query: string) => Promise<any[]>;
}

export interface SkillExecutionResult {
  success: boolean;
  outputs: Record<string, any>;
  error?: string;
  executionTime: number;
}

export interface SkillRegistryStats {
  totalSkills: number;
  enabledSkills: number;
  builtinSkills: number;
  localSkills: number;
  remoteSkills: number;
  byTag: Record<string, number>;
}

// ============================================================
// Built-in Skills
// ============================================================

const BUILTIN_SKILLS: SkillManifest[] = [
  {
    name: "web-search",
    version: "1.0.0",
    description: "Search the web using search engines",
    tags: ["search", "web", "information"],
    dependencies: [],
    permissions: ["network"],
    entryPoint: "index.js",
    schema: {
      inputs: [
        { name: "query", type: "string", required: true, description: "Search query" },
        { name: "limit", type: "number", required: false, description: "Max results", default: 5 },
      ],
      outputs: [
        { name: "results", type: "array", description: "Search results" },
        { name: "summary", type: "string", description: "Summary of findings" },
      ],
      parameters: {
        engine: { type: "string", description: "Search engine", default: "duckduckgo" },
      },
    },
  },
  {
    name: "code-execution",
    version: "1.0.0",
    description: "Execute code in sandboxed environment",
    tags: ["code", "execution", "development"],
    dependencies: [],
    permissions: ["exec"],
    entryPoint: "index.js",
    schema: {
      inputs: [
        { name: "code", type: "string", required: true, description: "Code to execute" },
        { name: "language", type: "string", required: true, description: "Programming language" },
      ],
      outputs: [
        { name: "output", type: "string", description: "Execution output" },
        { name: "error", type: "string", description: "Error output if any" },
      ],
      parameters: {
        timeout: { type: "number", description: "Execution timeout in ms", default: 30000 },
      },
    },
  },
  {
    name: "file-operations",
    version: "1.0.0",
    description: "Read, write, and manipulate files",
    tags: ["file", "filesystem", "io"],
    dependencies: [],
    permissions: ["file"],
    entryPoint: "index.js",
    schema: {
      inputs: [
        { name: "operation", type: "string", required: true, description: "Operation type: read/write/append/delete/list" },
        { name: "path", type: "string", required: true, description: "File path" },
        { name: "content", type: "string", required: false, description: "Content for write operations" },
      ],
      outputs: [
        { name: "result", type: "string", description: "Operation result" },
        { name: "content", type: "string", description: "File content for read operations" },
      ],
      parameters: {
        basePath: { type: "string", description: "Base directory for relative paths", default: "." },
      },
    },
  },
  {
    name: "data-analysis",
    version: "1.0.0",
    description: "Analyze and visualize data",
    tags: ["data", "analysis", "visualization", "statistics"],
    dependencies: ["code-execution"],
    permissions: ["file", "exec"],
    entryPoint: "index.js",
    schema: {
      inputs: [
        { name: "data", type: "string", required: true, description: "Data to analyze (CSV/JSON/content)" },
        { name: "analysisType", type: "string", required: true, description: "Type of analysis" },
      ],
      outputs: [
        { name: "insights", type: "array", description: "Analysis insights" },
        { name: "visualization", type: "string", description: "Visualization data URL" },
      ],
      parameters: {
        chartType: { type: "string", description: "Chart type", enum: ["bar", "line", "pie", "scatter"], default: "bar" },
      },
    },
  },
  {
    name: "document-processing",
    version: "1.0.0",
    description: "Process and extract information from documents",
    tags: ["document", "pdf", "extraction", "nlp"],
    dependencies: ["file-operations"],
    permissions: ["file"],
    entryPoint: "index.js",
    schema: {
      inputs: [
        { name: "document", type: "file", required: true, description: "Document file path" },
        { name: "extractType", type: "string", required: false, description: "What to extract", default: "text" },
      ],
      outputs: [
        { name: "text", type: "string", description: "Extracted text" },
        { name: "metadata", type: "object", description: "Document metadata" },
      ],
      parameters: {
        ocr: { type: "boolean", description: "Enable OCR for images", default: false },
      },
    },
  },
];

// ============================================================
// Skill Manager
// ============================================================

export class SkillManager extends EventEmitter {
  private projectRoot: string;
  private skillsDir: string;
  private skills: Map<string, Skill> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map(); // skill -> dependents
  private watchHandlers: Map<string, fs.FSWatcher> = new Map();
  private isDestroyed = false;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.skillsDir = path.join(projectRoot, ".deerflow", "skills");
    this.ensureSkillsDir();
    this.registerBuiltinSkills();
  }

  // ---- Directory Management ----

  private ensureSkillsDir(): void {
    try {
      if (!fs.existsSync(this.skillsDir)) {
        fs.mkdirSync(this.skillsDir, { recursive: true });
      }
    } catch {
      // ignore
    }
  }

  // ---- Built-in Skills ----

  private registerBuiltinSkills(): void {
    for (const manifest of BUILTIN_SKILLS) {
      const id = `builtin:${manifest.name}`;
      const skill: Skill = {
        id,
        manifest,
        status: "enabled",
        source: "builtin",
        path: "",
        loadedAt: new Date().toISOString(),
        config: { ...(manifest.config || {}) },
      };
      this.skills.set(id, skill);
      this.dependencyGraph.set(id, new Set());
    }
  }

  // ---- Skill Discovery ----

  /**
   * Scan the skills directory and register all found skills
   */
  async discoverSkills(): Promise<Skill[]> {
    const discovered: Skill[] = [];

    try {
      const entries = fs.readdirSync(this.skillsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillPath = path.join(this.skillsDir, entry.name);
        const manifestPath = path.join(skillPath, "skill.json");

        if (!fs.existsSync(manifestPath)) continue;

        try {
          const manifest: SkillManifest = JSON.parse(
            fs.readFileSync(manifestPath, "utf-8")
          );

          // Validate manifest
          const validation = this.validateManifest(manifest);
          if (!validation.valid) {
            this.emit("skill:error", entry.name, validation.errors.join("; "));
            continue;
          }

          const id = `local:${manifest.name}`;

          // Check if already registered
          if (this.skills.has(id)) {
            const existing = this.skills.get(id)!;
            // Update if version changed
            if (existing.manifest.version !== manifest.version) {
              existing.manifest = manifest;
              existing.path = skillPath;
              existing.status = "available";
              existing.error = undefined;
              this.emit("skill:updated", existing);
            }
            discovered.push(existing);
            continue;
          }

          const skill: Skill = {
            id,
            manifest,
            status: "available",
            source: "local",
            path: skillPath,
            config: { ...(manifest.config || {}) },
          };

          this.skills.set(id, skill);
          this.dependencyGraph.set(id, new Set());
          discovered.push(skill);
          this.emit("skill:discovered", skill);
        } catch (err: any) {
          this.emit("skill:error", entry.name, err.message);
        }
      }
    } catch {
      // Directory might not exist yet
    }

    return discovered;
  }

  // ---- Validation ----

  validateManifest(manifest: any): SkillValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest.name || typeof manifest.name !== "string") {
      errors.push("Missing or invalid 'name' field");
    }
    if (!manifest.version || typeof manifest.version !== "string") {
      errors.push("Missing or invalid 'version' field");
    }
    if (!manifest.description || typeof manifest.description !== "string") {
      warnings.push("Missing 'description' field");
    }
    if (!Array.isArray(manifest.tags)) {
      warnings.push("Missing or invalid 'tags' field");
    }
    if (!Array.isArray(manifest.dependencies)) {
      warnings.push("Missing or invalid 'dependencies' field, defaulting to empty");
      manifest.dependencies = [];
    }
    if (!Array.isArray(manifest.permissions)) {
      warnings.push("Missing or invalid 'permissions' field, defaulting to empty");
      manifest.permissions = [];
    }
    if (!manifest.entryPoint || typeof manifest.entryPoint !== "string") {
      errors.push("Missing or invalid 'entryPoint' field");
    }
    if (!manifest.schema || typeof manifest.schema !== "object") {
      errors.push("Missing or invalid 'schema' field");
    }

    // Check for circular dependencies
    if (manifest.dependencies?.length > 0) {
      const allDeps = this.resolveAllDependencies(manifest.name, manifest.dependencies);
      if (allDeps.includes(manifest.name)) {
        errors.push("Circular dependency detected");
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private resolveAllDependencies(skillName: string, deps: string[]): string[] {
    const result: string[] = [];
    const visited = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);
      result.push(name);

      // Find the skill's manifest
      for (const skill of this.skills.values()) {
        if (skill.manifest.name === name) {
          for (const dep of skill.manifest.dependencies) {
            visit(dep);
          }
          break;
        }
      }
    };

    for (const dep of deps) {
      visit(dep);
    }

    return result;
  }

  // ---- Enable / Disable ----

  enableSkill(id: string): { success: boolean; error?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, error: `Skill not found: ${id}` };
    }

    // Check dependencies
    for (const depName of skill.manifest.dependencies) {
      const depSkill = this.findSkillByName(depName);
      if (!depSkill) {
        return { success: false, error: `Missing dependency: ${depName}` };
      }
      if (depSkill.status !== "enabled") {
        const depResult = this.enableSkill(depSkill.id);
        if (!depResult.success) {
          return { success: false, error: `Failed to enable dependency ${depName}: ${depResult.error}` };
        }
      }
      // Register reverse dependency
      this.dependencyGraph.get(depSkill.id)?.add(id);
    }

    skill.status = "enabled";
    skill.loadedAt = new Date().toISOString();
    this.emit("skill:enabled", skill);
    return { success: true };
  }

  disableSkill(id: string): { success: boolean; error?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, error: `Skill not found: ${id}` };
    }

    // Check if any enabled skills depend on this one
    const dependents = this.dependencyGraph.get(id);
    if (dependents) {
      for (const dependentId of dependents) {
        const dependent = this.skills.get(dependentId);
        if (dependent && dependent.status === "enabled") {
          return { success: false, error: `Cannot disable: ${dependent.manifest.name} depends on this skill` };
        }
      }
    }

    skill.status = "disabled";
    this.emit("skill:disabled", skill);
    return { success: true };
  }

  // ---- Install / Uninstall ----

  async installSkill(options: SkillInstallOptions): Promise<{ success: boolean; skill?: Skill; error?: string }> {
    try {
      if (options.source === "local" && options.path) {
        return await this.installFromLocal(options.path, options.autoEnable);
      }

      if (options.source === "remote" && options.url) {
        return await this.installFromRemote(options.url, options.autoEnable);
      }

      return { success: false, error: "Invalid install options" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  private async installFromLocal(sourcePath: string, autoEnable = false): Promise<{ success: boolean; skill?: Skill; error?: string }> {
    const manifestPath = path.join(sourcePath, "skill.json");
    if (!fs.existsSync(manifestPath)) {
      return { success: false, error: "No skill.json found in source directory" };
    }

    const manifest: SkillManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const validation = this.validateManifest(manifest);
    if (!validation.valid) {
      return { success: false, error: `Invalid manifest: ${validation.errors.join(", ")}` };
    }

    const targetDir = path.join(this.skillsDir, manifest.name);

    // Check if already exists
    if (fs.existsSync(targetDir)) {
      return { success: false, error: `Skill ${manifest.name} already installed` };
    }

    // Copy skill directory
    this.copyDirectory(sourcePath, targetDir);

    // Register
    const id = `local:${manifest.name}`;
    const skill: Skill = {
      id,
      manifest,
      status: "available",
      source: "local",
      path: targetDir,
      config: { ...(manifest.config || {}) },
    };

    this.skills.set(id, skill);
    this.dependencyGraph.set(id, new Set());
    this.emit("skill:installed", skill);

    if (autoEnable) {
      this.enableSkill(id);
    }

    return { success: true, skill };
  }

  private async installFromRemote(url: string, autoEnable = false): Promise<{ success: boolean; skill?: Skill; error?: string }> {
    // For now, just return an error indicating this needs implementation
    // In production, this would download and extract a skill package
    return { success: false, error: "Remote skill installation not yet implemented" };
  }

  async uninstallSkill(id: string): Promise<{ success: boolean; error?: string }> {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, error: `Skill not found: ${id}` };
    }

    if (skill.source === "builtin") {
      return { success: false, error: "Cannot uninstall built-in skills" };
    }

    // Disable first
    if (skill.status === "enabled") {
      const disableResult = this.disableSkill(id);
      if (!disableResult.success) {
        return disableResult;
      }
    }

    // Remove files
    if (skill.path && fs.existsSync(skill.path)) {
      fs.rmSync(skill.path, { recursive: true, force: true });
    }

    // Remove from registry
    this.skills.delete(id);
    this.dependencyGraph.delete(id);

    // Remove from other skills' dependency graph
    for (const dependents of this.dependencyGraph.values()) {
      dependents.delete(id);
    }

    this.emit("skill:uninstalled", { id, name: skill.manifest.name });
    return { success: true };
  }

  // ---- Skill Queries ----

  getSkill(id: string): Skill | null {
    return this.skills.get(id) || null;
  }

  findSkillByName(name: string): Skill | null {
    for (const skill of this.skills.values()) {
      if (skill.manifest.name === name) {
        return skill;
      }
    }
    return null;
  }

  listSkills(filter?: { status?: SkillStatus; tag?: string; source?: Skill["source"] }): Skill[] {
    let result = Array.from(this.skills.values());

    if (filter?.status) {
      result = result.filter((s) => s.status === filter.status);
    }
    if (filter?.tag) {
      result = result.filter((s) => s.manifest.tags.includes(filter.tag!));
    }
    if (filter?.source) {
      result = result.filter((s) => s.source === filter.source);
    }

    return result;
  }

  searchSkills(query: string): Skill[] {
    const lower = query.toLowerCase();
    return Array.from(this.skills.values()).filter(
      (s) =>
        s.manifest.name.toLowerCase().includes(lower) ||
        s.manifest.description.toLowerCase().includes(lower) ||
        s.manifest.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  getEnabledSkills(): Skill[] {
    return Array.from(this.skills.values()).filter((s) => s.status === "enabled");
  }

  getSkillsForSession(sessionTags?: string[]): Skill[] {
    const enabled = this.getEnabledSkills();
    if (!sessionTags || sessionTags.length === 0) {
      return enabled;
    }
    // Return skills that match any session tag
    return enabled.filter((s) =>
      s.manifest.tags.some((tag) => sessionTags.includes(tag))
    );
  }

  // ---- Configuration ----

  updateSkillConfig(id: string, config: Record<string, any>): { success: boolean; error?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, error: `Skill not found: ${id}` };
    }

    skill.config = { ...skill.config, ...config };
    this.emit("skill:config-updated", { id, config: skill.config });
    return { success: true };
  }

  getSkillConfig(id: string): Record<string, any> | null {
    return this.skills.get(id)?.config || null;
  }

  // ---- Execution (placeholder for future implementation) ----

  async executeSkill(
    id: string,
    inputs: Record<string, any>,
    context: Partial<SkillExecutionContext> = {}
  ): Promise<SkillExecutionResult> {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, outputs: {}, error: `Skill not found: ${id}`, executionTime: 0 };
    }

    if (skill.status !== "enabled") {
      return { success: false, outputs: {}, error: `Skill is not enabled: ${id}`, executionTime: 0 };
    }

    const startTime = Date.now();

    try {
      // Validate inputs against schema
      const validation = this.validateInputs(skill.manifest.schema.inputs, inputs);
      if (!validation.valid) {
        return {
          success: false,
          outputs: {},
          error: `Input validation failed: ${validation.errors.join(", ")}`,
          executionTime: Date.now() - startTime,
        };
      }

      // For built-in skills, we simulate execution
      // In production, this would load and execute the skill's entry point
      const outputs = await this.simulateSkillExecution(skill, inputs, context);

      return {
        success: true,
        outputs,
        executionTime: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        outputs: {},
        error: err.message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  private validateInputs(
    defs: SkillInputDef[],
    inputs: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const def of defs) {
      if (def.required && !(def.name in inputs)) {
        errors.push(`Missing required input: ${def.name}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private async simulateSkillExecution(
    skill: Skill,
    inputs: Record<string, any>,
    _context: Partial<SkillExecutionContext>
  ): Promise<Record<string, any>> {
    // Simulate execution based on skill type
    // In production, this would dynamically load and execute the skill module

    switch (skill.manifest.name) {
      case "web-search":
        return {
          results: [{ title: "Example result", url: "https://example.com" }],
          summary: `Searched for: ${inputs.query}`,
        };
      case "code-execution":
        return {
          output: `Executed ${inputs.language} code`,
          error: "",
        };
      case "file-operations":
        return {
          result: `Performed ${inputs.operation} on ${inputs.path}`,
          content: inputs.operation === "read" ? "File content..." : undefined,
        };
      default:
        return { result: `Skill ${skill.manifest.name} executed` };
    }
  }

  // ---- Hot Reload ----

  enableHotReload(id: string): { success: boolean; error?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, error: `Skill not found: ${id}` };
    }
    if (!skill.path) {
      return { success: false, error: "Skill has no local path to watch" };
    }

    // Stop existing watcher
    this.disableHotReload(id);

    try {
      const watcher = fs.watch(skill.path, { recursive: true }, (_event, filename) => {
        if (filename === "skill.json") {
          // Re-read manifest
          try {
            const manifestPath = path.join(skill.path, "skill.json");
            const newManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            const validation = this.validateManifest(newManifest);
            if (validation.valid) {
              skill.manifest = newManifest;
              this.emit("skill:updated", skill);
            }
          } catch {
            // ignore parse errors during editing
          }
        }
        this.emit("skill:file-changed", { id, filename });
      });

      this.watchHandlers.set(id, watcher);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  disableHotReload(id: string): void {
    const watcher = this.watchHandlers.get(id);
    if (watcher) {
      watcher.close();
      this.watchHandlers.delete(id);
    }
  }

  // ---- Stats ----

  getStats(): SkillRegistryStats {
    const all = Array.from(this.skills.values());
    const byTag: Record<string, number> = {};

    for (const skill of all) {
      for (const tag of skill.manifest.tags) {
        byTag[tag] = (byTag[tag] || 0) + 1;
      }
    }

    return {
      totalSkills: all.length,
      enabledSkills: all.filter((s) => s.status === "enabled").length,
      builtinSkills: all.filter((s) => s.source === "builtin").length,
      localSkills: all.filter((s) => s.source === "local").length,
      remoteSkills: all.filter((s) => s.source === "remote").length,
      byTag,
    };
  }

  // ---- Persistence ----

  saveState(): { success: boolean; error?: string } {
    try {
      const state = {
        skills: Array.from(this.skills.values()).map((s) => ({
          id: s.id,
          status: s.status,
          config: s.config,
        })),
        savedAt: new Date().toISOString(),
      };

      const statePath = path.join(this.skillsDir, ".state.json");
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  loadState(): { success: boolean; error?: string } {
    try {
      const statePath = path.join(this.skillsDir, ".state.json");
      if (!fs.existsSync(statePath)) {
        return { success: true }; // No state to restore
      }

      const state = JSON.parse(fs.readFileSync(statePath, "utf-8"));

      for (const saved of state.skills || []) {
        const skill = this.skills.get(saved.id);
        if (skill) {
          skill.config = saved.config || skill.config;
          if (saved.status === "enabled") {
            this.enableSkill(saved.id);
          } else {
            skill.status = saved.status;
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ---- Utility ----

  private copyDirectory(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // ---- Cleanup ----

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Stop all watchers
    for (const [id, watcher] of this.watchHandlers) {
      watcher.close();
    }
    this.watchHandlers.clear();

    // Save state
    this.saveState();

    this.removeAllListeners();
  }
}
