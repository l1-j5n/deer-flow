/** Plugin Manager type definitions. */

export type PluginStatus = "installed" | "enabled" | "disabled" | "error" | "incompatible";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  hooks: string[];
  dependencies?: Record<string, string>;
}

export interface Plugin {
  id: string;
  manifest: PluginManifest;
  status: PluginStatus;
  path: string;
  enabledAt?: string;
  error?: string;
  hookCount: number;
}

export interface PluginStats {
  totalPlugins: number;
  enabledPlugins: number;
  disabledPlugins: number;
  errorPlugins: number;
  incompatiblePlugins: number;
  totalHooks: number;
}
