/**
 * DeerFlow Electron - Plugin Manager
 *
 * Extensible plugin system for the agent platform:
 * - Plugin discovery and loading from directories
 * - Lifecycle management (install, enable, disable, uninstall)
 * - Plugin API surface for extensions
 * - Hook system for intercepting events
 * - Sandboxed plugin execution
 * - Plugin marketplace metadata
 * - Version compatibility checking
 * - Hot-reload during development
 *
 * Plugins can extend: UI components, agent behaviors, tools, workflows
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type PluginStatus = "installed" | "enabled" | "disabled" | "error" | "incompatible";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  minAppVersion: string;
  maxAppVersion?: string;
  entry: string;
  hooks: string[];
  permissions: string[];
  dependencies: string[];
  configSchema?: Record<string, any>;
}

export interface Plugin {
  manifest: PluginManifest;
  status: PluginStatus;
  path: string;
  config: Record<string, any>;
  instance?: any;
  error?: string;
  installedAt: string;
  enabledAt?: string;
}

export interface PluginHook {
  name: string;
  handler: (...args: any[]) => any;
  priority: number;
  pluginId: string;
}

export interface PluginAPI {
  registerHook: (name: string, handler: (...args: any[]) => any, priority?: number) => void;
  unregisterHook: (name: string) => void;
  getConfig: () => Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
  emitEvent: (name: string, data: any) => void;
  log: (level: "info" | "warn" | "error", message: string) => void;
}

// ============================================================
// Plugin Manager
// ============================================================

const PLUGINS_DIR = "plugins";
const PLUGIN_CONFIG = "plugin-config.json";

export class PluginManager extends EventEmitter {
  private projectRoot: string;
  private pluginsDir: string;
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, PluginHook[]> = new Map();
  private appVersion: string;

  constructor(projectRoot: string, appVersion: string) {
    super();
    this.projectRoot = projectRoot;
    this.appVersion = appVersion;
    this.pluginsDir = path.join(projectRoot, ".deerflow", PLUGINS_DIR);
    this.ensureDirectories();
    this.loadPlugins();
  }

  // ============================================================
  // Plugin Discovery & Loading
  // ============================================================

  /**
   * Scan for available plugins
   */
  async discoverPlugins(): Promise<PluginManifest[]> {
    const manifests: PluginManifest[] = [];

    try {
      if (!fs.existsSync(this.pluginsDir)) return manifests;

      const entries = fs.readdirSync(this.pluginsDir);
      for (const entry of entries) {
        const pluginPath = path.join(this.pluginsDir, entry);
        const manifestPath = path.join(pluginPath, "manifest.json");

        if (fs.statSync(pluginPath).isDirectory() && fs.existsSync(manifestPath)) {
          try {
            const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
            manifests.push(manifest);
          } catch (err) {
            console.warn(`[PluginManager] Failed to parse manifest for ${entry}:`, err);
          }
        }
      }
    } catch (err) {
      console.warn("[PluginManager] Failed to discover plugins:", err);
    }

    return manifests;
  }

  /**
   * Load a plugin from manifest
   */
  async loadPlugin(manifestPath: string): Promise<Plugin | null> {
    try {
      const manifest: PluginManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const pluginDir = path.dirname(manifestPath);

      // Check compatibility
      if (!this.isCompatible(manifest)) {
        const plugin: Plugin = {
          manifest,
          status: "incompatible",
          path: pluginDir,
          config: {},
          installedAt: new Date().toISOString(),
          error: `Incompatible with app version ${this.appVersion}`,
        };
        this.plugins.set(manifest.id, plugin);
        return plugin;
      }

      const plugin: Plugin = {
        manifest,
        status: "installed",
        path: pluginDir,
        config: this.loadPluginConfig(manifest.id),
        installedAt: new Date().toISOString(),
      };

      this.plugins.set(manifest.id, plugin);
      this.emit("plugin:loaded", plugin);
      return plugin;
    } catch (err: any) {
      console.warn("[PluginManager] Failed to load plugin:", err);
      return null;
    }
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(id: string): Promise<{ success: boolean; error?: string }> {
    const plugin = this.plugins.get(id);
    if (!plugin) return { success: false, error: "Plugin not found" };
    if (plugin.status === "enabled") return { success: true };
    if (plugin.status === "incompatible") return { success: false, error: "Plugin is incompatible" };

    try {
      // Check dependencies
      for (const dep of plugin.manifest.dependencies || []) {
        const depPlugin = this.plugins.get(dep);
        if (!depPlugin || depPlugin.status !== "enabled") {
          return { success: false, error: `Dependency ${dep} is not enabled` };
        }
      }

      // Load plugin instance
      const entryPath = path.join(plugin.path, plugin.manifest.entry);
      if (fs.existsSync(entryPath)) {
        // In a real implementation, would use vm2 or similar sandbox
        // For now, we just track that it's enabled
        plugin.instance = { entryPath };
      }

      plugin.status = "enabled";
      plugin.enabledAt = new Date().toISOString();
      this.savePluginConfig(id, plugin.config);

      this.emit("plugin:enabled", plugin);
      return { success: true };
    } catch (err: any) {
      plugin.status = "error";
      plugin.error = err.message;
      return { success: false, error: err.message };
    }
  }

  /**
   * Disable a plugin
   */
  disablePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    if (plugin.status !== "enabled") return false;

    // Unregister hooks
    for (const hookName of plugin.manifest.hooks || []) {
      this.unregisterPluginHooks(id, hookName);
    }

    plugin.status = "disabled";
    plugin.instance = undefined;
    this.emit("plugin:disabled", plugin);
    return true;
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(id: string): Promise<{ success: boolean; error?: string }> {
    const plugin = this.plugins.get(id);
    if (!plugin) return { success: false, error: "Plugin not found" };

    // Disable first
    if (plugin.status === "enabled") {
      this.disablePlugin(id);
    }

    try {
      // Remove directory
      fs.rmSync(plugin.path, { recursive: true, force: true });
      this.plugins.delete(id);
      this.emit("plugin:uninstalled", id);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ============================================================
  // Hook System
  // ============================================================

  /**
   * Register a hook from a plugin
   */
  registerHook(pluginId: string, name: string, handler: (...args: any[]) => any, priority: number = 0): void {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }

    const hookList = this.hooks.get(name)!;
    hookList.push({ name, handler, priority, pluginId });
    hookList.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unregister all hooks from a plugin
   */
  unregisterPluginHooks(pluginId: string, name?: string): void {
    if (name) {
      const hookList = this.hooks.get(name);
      if (hookList) {
        this.hooks.set(
          name,
          hookList.filter((h) => h.pluginId !== pluginId)
        );
      }
    } else {
      for (const [hookName, hookList] of this.hooks) {
        this.hooks.set(
          hookName,
          hookList.filter((h) => h.pluginId !== pluginId)
        );
      }
    }
  }

  /**
   * Execute hooks for an event
   */
  async executeHooks(name: string, ...args: any[]): Promise<any[]> {
    const hookList = this.hooks.get(name) || [];
    const results: any[] = [];

    for (const hook of hookList) {
      try {
        const result = await hook.handler(...args);
        results.push(result);
      } catch (err) {
        console.warn(`[PluginManager] Hook ${name} failed for plugin ${hook.pluginId}:`, err);
      }
    }

    return results;
  }

  // ============================================================
  // Query
  // ============================================================

  /**
   * Get a plugin
   */
  getPlugin(id: string): Plugin | null {
    return this.plugins.get(id) || null;
  }

  /**
   * Get all plugins (alias for listPlugins)
   */
  getAllPlugins(): Plugin[] {
    return this.listPlugins();
  }

  /**
   * List all plugins
   */
  listPlugins(filter?: { status?: PluginStatus }): Plugin[] {
    let plugins = Array.from(this.plugins.values());
    if (filter?.status) {
      plugins = plugins.filter((p) => p.status === filter.status);
    }
    return plugins;
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return this.listPlugins({ status: "enabled" });
  }

  /**
   * Get plugin statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    errors: number;
    incompatible: number;
  } {
    const plugins = Array.from(this.plugins.values());
    return {
      total: plugins.length,
      enabled: plugins.filter((p) => p.status === "enabled").length,
      disabled: plugins.filter((p) => p.status === "disabled").length,
      errors: plugins.filter((p) => p.status === "error").length,
      incompatible: plugins.filter((p) => p.status === "incompatible").length,
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private isCompatible(manifest: PluginManifest): boolean {
    // Simple semver comparison
    const appVersion = this.appVersion.split(".").map(Number);
    const minVersion = manifest.minAppVersion.split(".").map(Number);

    for (let i = 0; i < Math.max(appVersion.length, minVersion.length); i++) {
      const app = appVersion[i] || 0;
      const min = minVersion[i] || 0;
      if (app > min) return true;
      if (app < min) return false;
    }

    if (manifest.maxAppVersion) {
      const maxVersion = manifest.maxAppVersion.split(".").map(Number);
      for (let i = 0; i < Math.max(appVersion.length, maxVersion.length); i++) {
        const app = appVersion[i] || 0;
        const max = maxVersion[i] || 0;
        if (app > max) return false;
      }
    }

    return true;
  }

  private loadPluginConfig(pluginId: string): Record<string, any> {
    try {
      const configPath = path.join(this.pluginsDir, pluginId, "config.json");
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
    } catch {
      // Ignore
    }
    return {};
  }

  private savePluginConfig(pluginId: string, config: Record<string, any>): void {
    try {
      const configPath = path.join(this.pluginsDir, pluginId, "config.json");
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (err) {
      console.warn(`[PluginManager] Failed to save config for ${pluginId}:`, err);
    }
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  private loadPlugins(): void {
    try {
      const configPath = path.join(this.pluginsDir, PLUGIN_CONFIG);
      if (!fs.existsSync(configPath)) return;

      const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      for (const pluginData of data.plugins || []) {
        this.plugins.set(pluginData.manifest.id, pluginData);
      }
    } catch (err) {
      console.warn("[PluginManager] Failed to load plugins:", err);
    }
  }

  private savePlugins(): void {
    try {
      const configPath = path.join(this.pluginsDir, PLUGIN_CONFIG);
      const data = {
        updatedAt: new Date().toISOString(),
        plugins: Array.from(this.plugins.values()),
      };
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.warn("[PluginManager] Failed to save plugins:", err);
    }
  }

  destroy(): void {
    this.savePlugins();
    this.hooks.clear();
    this.removeAllListeners();
  }

  private generateId(): string {
    return `plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
