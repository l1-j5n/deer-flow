import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "./api";
import type { PluginManifest, ScaffoldOptions } from "./types";

/**
 * Hook to validate a plugin manifest.
 */
export function useValidateManifest() {
  return useMutation({
    mutationFn: (manifest: Partial<PluginManifest>) => {
      // Convert Partial<PluginManifest> to required fields with defaults
      const manifestInput = {
        id: manifest.id || "",
        name: manifest.name || "",
        version: manifest.version || "1.0.0",
        description: manifest.description || "",
        author: manifest.author || "",
        license: manifest.license || "MIT",
        permissions: manifest.permissions || [],
        hooks: manifest.hooks || [],
        dependencies: manifest.dependencies || {},
        entry: manifest.entry || "index.js",
        minPlatformVersion: manifest.minPlatformVersion || "2.0.0",
      };
      return api.validateManifest(manifestInput as PluginManifest);
    },
  });
}

/**
 * Hook to generate a plugin scaffold.
 */
export function useGenerateScaffold() {
  return useMutation({
    mutationFn: ({
      manifest,
      options,
    }: {
      manifest: Partial<PluginManifest>;
      options: ScaffoldOptions;
    }) => {
      const manifestInput = {
        id: manifest.id || "",
        name: manifest.name || "",
        version: manifest.version || "1.0.0",
        description: manifest.description || "",
        author: manifest.author || "",
        license: manifest.license || "MIT",
        permissions: manifest.permissions || [],
        hooks: manifest.hooks || [],
        dependencies: manifest.dependencies || {},
        entry: manifest.entry || "index.js",
        minPlatformVersion: manifest.minPlatformVersion || "2.0.0",
      };
      return api.generateScaffold(manifestInput as PluginManifest, options);
    },
  });
}

/**
 * Hook to get available scaffold templates.
 */
export function useScaffoldTemplates() {
  return useQuery({
    queryKey: ["plugin-sdk", "templates"],
    queryFn: api.getScaffoldTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}