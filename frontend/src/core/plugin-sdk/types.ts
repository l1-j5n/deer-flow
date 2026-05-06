// Plugin SDK types
export interface ManifestField {
  id: string;
  label: string;
  type: "string" | "array" | "object" | "boolean";
  required: boolean;
  description: string;
  placeholder?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  permissions: string[];
  hooks: string[];
  dependencies: Record<string, string>;
  entry: string;
  minPlatformVersion: string;
}

export interface ScaffoldOptions {
  language: string;
  includeTests: boolean;
  includeDocs: boolean;
}

export interface ScaffoldResult {
  ok: boolean;
  message: string;
  files: Record<string, string>;
}

export interface ScaffoldTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
}