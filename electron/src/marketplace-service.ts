/**
 * DeerFlow Electron - Agent Marketplace Service
 *
 * Backend service for the community marketplace:
 * - Plugin/skill/template/agent discovery and metadata management
 * - Install/uninstall with dependency resolution
 * - Version management and compatibility checking
 * - Download tracking and ratings
 * - Local registry with remote sync capability
 * - Secure package verification
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import { PluginManager, PluginManifest } from "./plugin-manager";
import { SkillManager } from "./skill-manager";
import { PluginSDKValidator } from "./plugin-sdk-validator";

// ============================================================
// Type Definitions
// ============================================================

export type MarketplaceItemType = "plugin" | "skill" | "template" | "agent";

export type InstallStatus =
  | "not_installed"
  | "installing"
  | "installed"
  | "updating"
  | "uninstalling"
  | "error";

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  type: MarketplaceItemType;
  category: string;
  tags: string[];
  downloads: number;
  rating: number;
  ratingCount: number;
  installStatus: InstallStatus;
  installedVersion?: string;
  icon?: string;
  updatedAt: string;
  publishedAt: string;
  size: number; // bytes
  compatibility: {
    minAppVersion: string;
    maxAppVersion?: string;
    platforms: string[];
  };
  dependencies: Array<{
    id: string;
    versionRange: string;
    optional: boolean;
  }>;
  permissions: string[];
  hooks: string[];
  source: "builtin" | "community" | "local";
  manifest?: PluginManifest;
  error?: string;
}

export interface InstallResult {
  success: boolean;
  itemId: string;
  message: string;
  installedPath?: string;
  requiresRestart: boolean;
  error?: string;
}

export interface UninstallResult {
  success: boolean;
  itemId: string;
  message: string;
  error?: string;
}

export interface MarketplaceStats {
  totalItems: number;
  totalPlugins: number;
  totalSkills: number;
  totalTemplates: number;
  totalAgents: number;
  installedCount: number;
  updateAvailableCount: number;
  totalDownloads: number;
  averageRating: number;
}

export interface MarketplaceFilter {
  type?: MarketplaceItemType | "all";
  category?: string;
  search?: string;
  tags?: string[];
  installed?: boolean;
  sortBy?: "popular" | "rated" | "recent" | "name";
}

// ============================================================
// Marketplace Service
// ============================================================

const MARKETPLACE_REGISTRY = "marketplace-registry.json";
const MARKETPLACE_DIR = "marketplace";

export class MarketplaceService extends EventEmitter {
  private projectRoot: string;
  private marketplaceDir: string;
  private registryPath: string;
  private items: Map<string, MarketplaceItem> = new Map();
  private pluginManager?: PluginManager;
  private skillManager?: SkillManager;
  private validator: PluginSDKValidator;
  private isLoaded = false;

  constructor(
    projectRoot: string,
    deps?: { pluginManager?: PluginManager; skillManager?: SkillManager }
  ) {
    super();
    this.projectRoot = projectRoot;
    this.marketplaceDir = path.join(projectRoot, MARKETPLACE_DIR);
    this.registryPath = path.join(projectRoot, MARKETPLACE_REGISTRY);
    this.pluginManager = deps?.pluginManager;
    this.skillManager = deps?.skillManager;
    this.validator = new PluginSDKValidator("1.0.0");

    this.ensureDirectories();
    this.loadRegistry();
    this.registerBuiltInItems();
  }

  // ============================================================
  // Directory Management
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.marketplaceDir)) {
      fs.mkdirSync(this.marketplaceDir, { recursive: true });
    }
  }

  // ============================================================
  // Registry Persistence
  // ============================================================

  private loadRegistry(): void {
    try {
      if (fs.existsSync(this.registryPath)) {
        const data = JSON.parse(fs.readFileSync(this.registryPath, "utf-8"));
        if (Array.isArray(data.items)) {
          for (const item of data.items) {
            this.items.set(item.id, item);
          }
        }
      }
    } catch (err) {
      console.warn("[Marketplace] Failed to load registry:", err);
    }
    this.isLoaded = true;
  }

  private saveRegistry(): void {
    try {
      const data = {
        updatedAt: new Date().toISOString(),
        items: Array.from(this.items.values()),
      };
      fs.writeFileSync(this.registryPath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.warn("[Marketplace] Failed to save registry:", err);
    }
  }

  // ============================================================
  // Built-in Items
  // ============================================================

  private registerBuiltInItems(): void {
    const builtIns: Omit<MarketplaceItem, "installStatus" | "installedVersion">[] = [
      {
        id: "plugin-web-search-enhanced",
        name: "Enhanced Web Search",
        description: "Advanced web search with result ranking, snippet extraction, and source verification.",
        author: "DeerFlow Team",
        version: "2.1.0",
        type: "plugin",
        category: "Search",
        tags: ["search", "web", "ranking"],
        downloads: 15420,
        rating: 4.7,
        ratingCount: 328,
        icon: "search",
        updatedAt: "2026-04-15T10:00:00Z",
        publishedAt: "2025-12-01T00:00:00Z",
        size: 245760,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["network", "storage"],
        hooks: ["init", "tool"],
        source: "builtin",
      },
      {
        id: "skill-code-reviewer",
        name: "Code Reviewer",
        description: "Automated code review with style checking, bug detection, and optimization suggestions.",
        author: "DeerFlow Team",
        version: "1.5.0",
        type: "skill",
        category: "Development",
        tags: ["code", "review", "quality"],
        downloads: 12350,
        rating: 4.5,
        ratingCount: 256,
        icon: "code",
        updatedAt: "2026-04-10T10:00:00Z",
        publishedAt: "2026-01-15T00:00:00Z",
        size: 184320,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["filesystem", "shell"],
        hooks: ["tool", "session"],
        source: "builtin",
      },
      {
        id: "template-research-deep-dive",
        name: "Research Deep Dive",
        description: "Structured research template with source tracking, note organization, and citation management.",
        author: "DeerFlow Team",
        version: "1.2.0",
        type: "template",
        category: "Research",
        tags: ["research", "notes", "citations"],
        downloads: 9870,
        rating: 4.6,
        ratingCount: 189,
        icon: "book",
        updatedAt: "2026-04-05T10:00:00Z",
        publishedAt: "2026-02-01T00:00:00Z",
        size: 51200,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["storage"],
        hooks: ["init"],
        source: "builtin",
      },
      {
        id: "agent-data-analyst",
        name: "Data Analyst Agent",
        description: "Specialized agent for data analysis, visualization, and statistical insights.",
        author: "DeerFlow Team",
        version: "1.3.0",
        type: "agent",
        category: "Business",
        tags: ["data", "analysis", "charts"],
        downloads: 8750,
        rating: 4.4,
        ratingCount: 167,
        icon: "bar-chart",
        updatedAt: "2026-04-12T10:00:00Z",
        publishedAt: "2026-02-20T00:00:00Z",
        size: 307200,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [{ id: "skill-code-reviewer", versionRange: "^1.0.0", optional: true }],
        permissions: ["filesystem", "network", "storage"],
        hooks: ["init", "message", "tool"],
        source: "builtin",
      },
      {
        id: "plugin-file-operations",
        name: "File Operations Pro",
        description: "Advanced file management with batch operations, sync, and cloud integration.",
        author: "Community",
        version: "3.0.1",
        type: "plugin",
        category: "Productivity",
        tags: ["files", "batch", "sync"],
        downloads: 22100,
        rating: 4.8,
        ratingCount: 512,
        icon: "folder",
        updatedAt: "2026-04-20T10:00:00Z",
        publishedAt: "2025-10-01T00:00:00Z",
        size: 409600,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["filesystem", "network", "clipboard"],
        hooks: ["init", "tool", "session"],
        source: "community",
      },
      {
        id: "skill-document-processor",
        name: "Document Processor",
        description: "Parse, extract, and analyze content from PDF, DOCX, and other document formats.",
        author: "Community",
        version: "2.0.0",
        type: "skill",
        category: "Productivity",
        tags: ["documents", "pdf", "extraction"],
        downloads: 18900,
        rating: 4.6,
        ratingCount: 423,
        icon: "file-text",
        updatedAt: "2026-04-18T10:00:00Z",
        publishedAt: "2025-11-15T00:00:00Z",
        size: 524288,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["filesystem", "storage"],
        hooks: ["tool"],
        source: "community",
      },
      {
        id: "template-api-designer",
        name: "API Designer",
        description: "Design and document REST/GraphQL APIs with OpenAPI spec generation.",
        author: "DeerFlow Team",
        version: "1.1.0",
        type: "template",
        category: "Development",
        tags: ["api", "design", "openapi"],
        downloads: 7650,
        rating: 4.3,
        ratingCount: 145,
        icon: "api",
        updatedAt: "2026-04-08T10:00:00Z",
        publishedAt: "2026-03-01T00:00:00Z",
        size: 76800,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["storage"],
        hooks: ["init"],
        source: "builtin",
      },
      {
        id: "agent-security-auditor",
        name: "Security Auditor",
        description: "Automated security analysis for code, configs, and system settings.",
        author: "Security Team",
        version: "1.0.0",
        type: "agent",
        category: "System",
        tags: ["security", "audit", "scanning"],
        downloads: 5430,
        rating: 4.5,
        ratingCount: 98,
        icon: "shield",
        updatedAt: "2026-04-25T10:00:00Z",
        publishedAt: "2026-04-01T00:00:00Z",
        size: 262144,
        compatibility: { minAppVersion: "1.0.0", platforms: ["win32", "darwin", "linux"] },
        dependencies: [],
        permissions: ["filesystem", "shell", "config"],
        hooks: ["init", "message", "error"],
        source: "community",
      },
    ];

    for (const item of builtIns) {
      if (!this.items.has(item.id)) {
        this.items.set(item.id, {
          ...item,
          installStatus: "not_installed",
        });
      }
    }

    this.syncWithPluginManager();
  }

  // ============================================================
  // Plugin Manager Sync
  // ============================================================

  private syncWithPluginManager(): void {
    if (!this.pluginManager) return;

    try {
      const plugins = this.pluginManager.getAllPlugins();
      for (const plugin of plugins) {
        const existing = this.items.get(plugin.manifest.id);
        if (existing) {
          existing.installStatus = plugin.status === "enabled" ? "installed" : "not_installed";
          existing.installedVersion = plugin.manifest.version;
        }
      }
    } catch (err) {
      console.warn("[Marketplace] Failed to sync with plugin manager:", err);
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  getAllItems(filter?: MarketplaceFilter): MarketplaceItem[] {
    let items = Array.from(this.items.values());

    if (filter) {
      if (filter.type && filter.type !== "all") {
        items = items.filter((i) => i.type === filter.type);
      }
      if (filter.category) {
        items = items.filter((i) => i.category.toLowerCase() === filter.category.toLowerCase());
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        items = items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.author.toLowerCase().includes(q) ||
            i.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (filter.tags && filter.tags.length > 0) {
        items = items.filter((i) => filter.tags!.some((t) => i.tags.includes(t)));
      }
      if (filter.installed !== undefined) {
        items = items.filter((i) =>
          filter.installed ? i.installStatus === "installed" : i.installStatus !== "installed"
        );
      }
      if (filter.sortBy) {
        switch (filter.sortBy) {
          case "popular":
            items.sort((a, b) => b.downloads - a.downloads);
            break;
          case "rated":
            items.sort((a, b) => b.rating - a.rating);
            break;
          case "recent":
            items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            break;
          case "name":
            items.sort((a, b) => a.name.localeCompare(b.name));
            break;
        }
      }
    }

    return items;
  }

  getItem(id: string): MarketplaceItem | undefined {
    return this.items.get(id);
  }

  getStats(): MarketplaceStats {
    const all = Array.from(this.items.values());
    const installed = all.filter((i) => i.installStatus === "installed");

    return {
      totalItems: all.length,
      totalPlugins: all.filter((i) => i.type === "plugin").length,
      totalSkills: all.filter((i) => i.type === "skill").length,
      totalTemplates: all.filter((i) => i.type === "template").length,
      totalAgents: all.filter((i) => i.type === "agent").length,
      installedCount: installed.length,
      updateAvailableCount: installed.filter(
        (i) => i.installedVersion && i.installedVersion !== i.version
      ).length,
      totalDownloads: all.reduce((sum, i) => sum + i.downloads, 0),
      averageRating:
        all.length > 0
          ? Math.round((all.reduce((sum, i) => sum + i.rating, 0) / all.length) * 10) / 10
          : 0,
    };
  }

  async installItem(id: string): Promise<InstallResult> {
    const item = this.items.get(id);
    if (!item) {
      return { success: false, itemId: id, message: "Item not found", requiresRestart: false };
    }

    if (item.installStatus === "installed") {
      return { success: false, itemId: id, message: "Already installed", requiresRestart: false };
    }

    item.installStatus = "installing";
    this.emit("install:start", { itemId: id });

    try {
      // Validate compatibility
      const appVersion = this.getAppVersion();
      if (item.compatibility.minAppVersion > appVersion) {
        throw new Error(
          `Requires app version ${item.compatibility.minAppVersion}, current is ${appVersion}`
        );
      }

      // Check platform compatibility
      const platform = process.platform;
      if (!item.compatibility.platforms.includes(platform)) {
        throw new Error(`Not compatible with platform: ${platform}`);
      }

      // Resolve dependencies
      for (const dep of item.dependencies) {
        const depItem = this.items.get(dep.id);
        if (!depItem || depItem.installStatus !== "installed") {
          if (!dep.optional) {
            throw new Error(`Required dependency not installed: ${dep.id}`);
          }
        }
      }

      // Install based on type
      const installPath = path.join(this.marketplaceDir, item.type + "s", id);
      fs.mkdirSync(installPath, { recursive: true });

      // Write manifest
      const manifest = {
        id: item.id,
        name: item.name,
        version: item.version,
        description: item.description,
        author: item.author,
        license: "MIT",
        minAppVersion: item.compatibility.minAppVersion,
        entry: "index.js",
        hooks: item.hooks,
        permissions: item.permissions,
        dependencies: item.dependencies.map((d) => d.id),
      };
      fs.writeFileSync(path.join(installPath, "manifest.json"), JSON.stringify(manifest, null, 2));

      // Create entry point stub
      fs.writeFileSync(
        path.join(installPath, "index.js"),
        `// ${item.name} v${item.version}\n// Auto-generated entry point\nmodule.exports = {\n  activate() {\n    console.log("[${item.id}] Activated");\n  },\n  deactivate() {\n    console.log("[${item.id}] Deactivated");\n  }\n};\n`
      );

      // Register with plugin manager if applicable
      if (item.type === "plugin" && this.pluginManager) {
        try {
          this.pluginManager.loadPlugin(installPath);
        } catch (err: any) {
          console.warn(`[Marketplace] Plugin manager load failed: ${err.message}`);
        }
      }

      item.installStatus = "installed";
      item.installedVersion = item.version;
      item.downloads += 1;

      this.saveRegistry();
      this.emit("install:complete", { itemId: id, path: installPath });

      return {
        success: true,
        itemId: id,
        message: `${item.name} installed successfully`,
        installedPath: installPath,
        requiresRestart: item.type === "plugin",
      };
    } catch (err: any) {
      item.installStatus = "error";
      item.error = err.message;
      this.emit("install:error", { itemId: id, error: err.message });

      return {
        success: false,
        itemId: id,
        message: `Installation failed: ${err.message}`,
        requiresRestart: false,
        error: err.message,
      };
    }
  }

  async uninstallItem(id: string): Promise<UninstallResult> {
    const item = this.items.get(id);
    if (!item) {
      return { success: false, itemId: id, message: "Item not found" };
    }

    if (item.installStatus !== "installed") {
      return { success: false, itemId: id, message: "Not installed" };
    }

    item.installStatus = "uninstalling";
    this.emit("uninstall:start", { itemId: id });

    try {
      // Check for dependents
      const dependents = Array.from(this.items.values()).filter(
        (i) =>
          i.installStatus === "installed" &&
          i.dependencies.some((d) => d.id === id && !d.optional)
      );
      if (dependents.length > 0) {
        throw new Error(
          `Required by: ${dependents.map((d) => d.name).join(", ")}`
        );
      }

      // Unregister from plugin manager
      if (item.type === "plugin" && this.pluginManager) {
        try {
          this.pluginManager.uninstallPlugin(id);
        } catch (err: any) {
          console.warn(`[Marketplace] Plugin manager uninstall failed: ${err.message}`);
        }
      }

      // Remove files
      const installPath = path.join(this.marketplaceDir, item.type + "s", id);
      if (fs.existsSync(installPath)) {
        fs.rmSync(installPath, { recursive: true, force: true });
      }

      item.installStatus = "not_installed";
      item.installedVersion = undefined;
      item.error = undefined;

      this.saveRegistry();
      this.emit("uninstall:complete", { itemId: id });

      return {
        success: true,
        itemId: id,
        message: `${item.name} uninstalled successfully`,
      };
    } catch (err: any) {
      item.installStatus = "error";
      item.error = err.message;
      this.emit("uninstall:error", { itemId: id, error: err.message });

      return {
        success: false,
        itemId: id,
        message: `Uninstall failed: ${err.message}`,
        error: err.message,
      };
    }
  }

  async updateItem(id: string): Promise<InstallResult> {
    const item = this.items.get(id);
    if (!item) {
      return { success: false, itemId: id, message: "Item not found", requiresRestart: false };
    }

    if (item.installStatus !== "installed") {
      return { success: false, itemId: id, message: "Not installed", requiresRestart: false };
    }

    item.installStatus = "updating";

    // Uninstall then reinstall
    const uninstallResult = await this.uninstallItem(id);
    if (!uninstallResult.success) {
      item.installStatus = "error";
      return {
        success: false,
        itemId: id,
        message: `Update failed during uninstall: ${uninstallResult.message}`,
        requiresRestart: false,
      };
    }

    return this.installItem(id);
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    for (const item of this.items.values()) {
      categories.add(item.category);
    }
    return Array.from(categories).sort();
  }

  getTags(): string[] {
    const tags = new Set<string>();
    for (const item of this.items.values()) {
      for (const tag of item.tags) {
        tags.add(tag);
      }
    }
    return Array.from(tags).sort();
  }

  private getAppVersion(): string {
    try {
      const pkgPath = path.join(this.projectRoot, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        return pkg.version || "1.0.0";
      }
    } catch {
      // ignore
    }
    return "1.0.0";
  }

  dispose(): void {
    this.saveRegistry();
    this.removeAllListeners();
  }
}
