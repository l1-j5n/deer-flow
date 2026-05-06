import type {
  PluginManifest,
  ScaffoldOptions,
  ScaffoldResult,
  ValidationResult,
  ScaffoldTemplate,
} from "./types";

const API_BASE = "/api/electron/plugin-sdk";

/**
 * Validate a plugin manifest.
 */
export async function validateManifest(
  manifest: PluginManifest
): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(manifest),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      valid: false,
      errors: [error.detail || "Validation failed"],
      warnings: [],
    };
  }

  return response.json();
}

/**
 * Generate a plugin scaffold.
 */
export async function generateScaffold(
  manifest: PluginManifest,
  options: ScaffoldOptions
): Promise<ScaffoldResult> {
  const response = await fetch(`${API_BASE}/scaffold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...manifest, ...options }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      ok: false,
      message: error.detail || "Scaffold generation failed",
      files: {},
    };
  }

  return response.json();
}

/**
 * List available scaffold templates.
 */
export async function getScaffoldTemplates(): Promise<{
  templates: ScaffoldTemplate[];
}> {
  const response = await fetch(`${API_BASE}/templates`);

  if (!response.ok) {
    return { templates: [] };
  }

  return response.json();
}