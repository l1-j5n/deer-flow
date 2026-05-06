/**
 * DeerFlow Electron - Config Manager
 *
 * Manages DeerFlow configuration files (config.yaml, .env, extensions_config.json)
 * through IPC. Allows the renderer to read/write configuration without direct
 * filesystem access.
 *
 * Security: All writes are validated before being applied.
 */

import * as fs from "fs";
import * as path from "path";

const CONFIG_FILES = {
  config: "config.yaml",
  env: ".env",
  extensions: "extensions_config.json",
} as const;

export class ConfigManager {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Read a configuration file
   */
  readConfig(filename: "config" | "env" | "extensions"): {
    success: boolean;
    content?: string;
    error?: string;
  } {
    const filePath = this.getFilePath(filename);
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `File not found: ${filePath}` };
      }
      const content = fs.readFileSync(filePath, "utf-8");
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Write a configuration file (with validation)
   */
  writeConfig(
    filename: "config" | "env" | "extensions",
    content: string
  ): { success: boolean; error?: string } {
    const filePath = this.getFilePath(filename);

    try {
      // Validate content is not empty
      if (!content || content.trim().length === 0) {
        return { success: false, error: "Content cannot be empty" };
      }

      // Basic validation per file type
      if (filename === "extensions") {
        try {
          JSON.parse(content);
        } catch {
          return { success: false, error: "Invalid JSON format" };
        }
      }

      // Create backup before writing
      if (fs.existsSync(filePath)) {
        const backupPath = filePath + ".backup";
        fs.copyFileSync(filePath, backupPath);
      }

      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`[ConfigManager] Updated ${CONFIG_FILES[filename]}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get parsed model configurations from config.yaml
   */
  getModelConfigs(): {
    success: boolean;
    models?: Array<Record<string, any>>;
    error?: string;
  } {
    try {
      const result = this.readConfig("config");
      if (!result.success || !result.content) {
        return { success: false, error: result.error };
      }

      // Simple YAML parsing for models section
      const models: Array<Record<string, any>> = [];
      const lines = result.content.split("\n");
      let inModelsSection = false;
      let currentModel: Record<string, any> | null = null;

      for (const line of lines) {
        const trimmed = line.trim();

        // Detect models section
        if (trimmed === "models:") {
          inModelsSection = true;
          continue;
        }

        // End models section at next top-level key
        if (inModelsSection && /^[a-z_]+:/.test(trimmed) && !line.startsWith(" ") && !line.startsWith("  ")) {
          inModelsSection = false;
          if (currentModel) {
            models.push(currentModel);
            currentModel = null;
          }
          continue;
        }

        if (!inModelsSection) continue;

        // Detect model entry (starts with - name:)
        if (trimmed.startsWith("- name:")) {
          if (currentModel) {
            models.push(currentModel);
          }
          currentModel = { name: trimmed.replace("- name:", "").trim() };
          continue;
        }

        // Parse model properties
        if (currentModel && trimmed.includes(":") && !trimmed.startsWith("#")) {
          const colonIdx = trimmed.indexOf(":");
          const key = trimmed.substring(0, colonIdx).trim();
          const value = trimmed.substring(colonIdx + 1).trim();

          // Only capture non-commented values
          if (key && value && !value.startsWith("$") || (value.startsWith("$") && key === "api_key")) {
            // Remove inline comments
            const cleanValue = value.split(" #")[0].trim();
            if (cleanValue === "true") {
              currentModel[key] = true;
            } else if (cleanValue === "false") {
              currentModel[key] = false;
            } else {
              currentModel[key] = cleanValue;
            }
          }
        }
      }

      if (currentModel) {
        models.push(currentModel);
      }

      return { success: true, models };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if any models are configured
   */
  hasModelsConfigured(): boolean {
    const result = this.getModelConfigs();
    return result.success === true && (result.models?.length ?? 0) > 0;
  }

  /**
   * Get environment variable values from .env file
   */
  getEnvVariables(): {
    success: boolean;
    vars?: Record<string, string>;
    error?: string;
  } {
    const result = this.readConfig("env");
    if (!result.success || !result.content) {
      return { success: false, error: result.error };
    }

    const vars: Record<string, string> = {};
    for (const line of result.content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        vars[key] = value;
      }
    }

    return { success: true, vars };
  }

  /**
   * Set an environment variable in .env file
   */
  setEnvVariable(key: string, value: string): { success: boolean; error?: string } {
    const result = this.readConfig("env");
    const content = result.content || "";

    const lines = content.split("\n");
    let found = false;
    const newLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#")) {
        newLines.push(line);
        continue;
      }
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const existingKey = trimmed.substring(0, eqIdx).trim();
        if (existingKey === key) {
          newLines.push(`${key}=${value}`);
          found = true;
          continue;
        }
      }
      newLines.push(line);
    }

    if (!found) {
      newLines.push(`${key}=${value}`);
    }

    return this.writeConfig("env", newLines.join("\n"));
  }

  /**
   * Get a summary of the current configuration state
   */
  getConfigSummary(): {
    hasModels: boolean;
    modelCount: number;
    hasEnvVars: boolean;
    envVarCount: number;
    models: Array<Record<string, any>>;
  } {
    const modelResult = this.getModelConfigs();
    const envResult = this.getEnvVariables();

    const models = modelResult.models || [];
    const envVars = envResult.vars || {};
    const meaningfulEnvVars = Object.entries(envVars).filter(
      ([, v]) => v && !v.startsWith("your-") && v.length > 0
    );

    return {
      hasModels: models.length > 0,
      modelCount: models.length,
      hasEnvVars: meaningfulEnvVars.length > 0,
      envVarCount: meaningfulEnvVars.length,
      models,
    };
  }

  /**
   * Add a new model to config.yaml
   * Inserts a new model entry into the models list, preserving comments and structure
   */
  addModel(model: Record<string, any>): { success: boolean; error?: string } {
    try {
      const result = this.readConfig("config");
      if (!result.success || !result.content) {
        return { success: false, error: result.error || "Failed to read config" };
      }

      // Check for duplicate model name
      const existingModels = this.getModelConfigs();
      if (existingModels.success && existingModels.models) {
        const duplicate = existingModels.models.find(m => m.name === model.name);
        if (duplicate) {
          return { success: false, error: `Model "${model.name}" already exists` };
        }
      }

      let content = result.content;
      const modelName = model.name || "unnamed-model";

      // Build the YAML entry for this model
      const yamlEntry = this.buildModelYAML(model);

      // Find the models section and insert the entry
      // Strategy: Replace `models: []` or `models:` with models + new entry
      const emptyModelsMatch = content.match(/models:\s*\[\]/);
      if (emptyModelsMatch) {
        // Replace empty list with first model entry
        content = content.replace(
          emptyModelsMatch[0],
          `models:\n${yamlEntry}`
        );
      } else if (content.match(/^models:\s*$/m)) {
        // models: with no items (null case)
        content = content.replace(
          /^models:\s*$/m,
          `models:\n${yamlEntry}`
        );
      } else {
        // Find the last model entry and append after it
        const lines = content.split("\n");
        let lastModelLineIdx = -1;
        let modelsSectionStart = -1;
        let inModelsSection = false;

        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();

          if (trimmed === "models:" || trimmed.startsWith("models:")) {
            modelsSectionStart = i;
            inModelsSection = true;
            continue;
          }

          if (inModelsSection) {
            // Check if we've left the models section (next top-level key)
            if (/^[a-z_]+:/.test(trimmed) && !lines[i].startsWith(" ") && !lines[i].startsWith("  ")) {
              inModelsSection = false;
              continue;
            }

            // Track the last non-comment, non-empty line in models section
            if (trimmed.startsWith("- name:") && !trimmed.startsWith("#")) {
              lastModelLineIdx = i;
            }
          }
        }

        if (lastModelLineIdx >= 0) {
          // Find the end of the last model entry
          let insertIdx = lastModelLineIdx + 1;
          while (insertIdx < lines.length) {
            const line = lines[insertIdx];
            // Stop at next model entry, comment block, or section end
            if (line.trim().startsWith("- name:") && !line.trim().startsWith("#")) break;
            if (/^[a-z_]+:/.test(line.trim()) && !line.startsWith(" ") && !line.startsWith("  ")) break;
            if (line.trim() && !line.trim().startsWith("#") && !line.startsWith("  ") && !line.startsWith("    ")) break;
            // Still part of the current model entry or inline comments
            if (line.trim().startsWith("#") || line.trim() === "") {
              insertIdx++;
              continue;
            }
            insertIdx++;
          }
          lines.splice(insertIdx, 0, yamlEntry);
          content = lines.join("\n");
        } else if (modelsSectionStart >= 0) {
          // Models section exists but has no entries
          const lines = content.split("\n");
          lines.splice(modelsSectionStart + 1, 0, yamlEntry);
          content = lines.join("\n");
        } else {
          // No models section found — this shouldn't happen but handle gracefully
          return { success: false, error: "Could not find models section in config.yaml" };
        }
      }

      // Also save API key to .env if present
      this.saveApiKeyToEnv(model);

      return this.writeConfig("config", content);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Remove a model from config.yaml by name
   */
  removeModel(modelName: string): { success: boolean; error?: string } {
    try {
      const result = this.readConfig("config");
      if (!result.success || !result.content) {
        return { success: false, error: result.error || "Failed to read config" };
      }

      const lines = result.content.split("\n");
      let modelStartLine = -1;
      let modelEndLine = -1;
      let inModelsSection = false;
      let found = false;

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (trimmed === "models:" || trimmed.startsWith("models:")) {
          inModelsSection = true;
          continue;
        }

        if (inModelsSection && /^[a-z_]+:/.test(trimmed) && !lines[i].startsWith(" ") && !lines[i].startsWith("  ")) {
          inModelsSection = false;
          continue;
        }

        if (inModelsSection && trimmed.startsWith("- name:")) {
          const name = trimmed.replace("- name:", "").trim();
          if (name === modelName) {
            modelStartLine = i;
            found = true;

            // Find the end of this model entry
            modelEndLine = i + 1;
            while (modelEndLine < lines.length) {
              const nextLine = lines[modelEndLine];
              const nextTrimmed = nextLine.trim();

              // Stop conditions
              if (nextTrimmed.startsWith("- name:")) break;
              if (/^[a-z_]+:/.test(nextTrimmed) && !nextLine.startsWith(" ") && !nextLine.startsWith("  ")) break;
              if (nextTrimmed === "") {
                // Check if next non-empty line is still indented
                let peek = modelEndLine + 1;
                while (peek < lines.length && lines[peek].trim() === "") peek++;
                if (peek >= lines.length) break;
                const peekLine = lines[peek];
                if (!peekLine.startsWith("  ") && !peekLine.startsWith("    ")) break;
                if (peekLine.trim().startsWith("- name:")) break;
              }
              if (!nextLine.startsWith("  ") && !nextLine.startsWith("    ") && nextTrimmed !== "") break;
              modelEndLine++;
            }
            break;
          }
        }
      }

      if (!found) {
        return { success: false, error: `Model "${modelName}" not found` };
      }

      // Remove the model entry lines
      lines.splice(modelStartLine, modelEndLine - modelStartLine);

      // If no models left, set to empty list
      const remainingContent = lines.join("\n");
      const modelCheck = this.getModelConfigs();
      if (modelCheck.success && (!modelCheck.models || modelCheck.models.length === 0)) {
        // Replace models: (with nothing) to models: []
        const updatedLines = remainingContent.split("\n");
        for (let i = 0; i < updatedLines.length; i++) {
          if (updatedLines[i].trim() === "models:" || updatedLines[i].trim() === "models:") {
            updatedLines[i] = "models: []";
            break;
          }
        }
        return this.writeConfig("config", updatedLines.join("\n"));
      }

      return this.writeConfig("config", remainingContent);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Build a YAML string for a model configuration entry
   */
  private buildModelYAML(model: Record<string, any>): string {
    const lines: string[] = [`  - name: ${model.name}`];

    // Add display_name if different from name
    if (model.display_name && model.display_name !== model.name) {
      lines.push(`    display_name: ${model.display_name}`);
    }

    // Required fields
    lines.push(`    use: ${model.use}`);
    lines.push(`    model: ${model.model || ""}`);

    // API key — reference env var
    const provider = this.detectProvider(model.use);
    if (model.api_key) {
      if (provider?.envVar) {
        lines.push(`    api_key: $\{${provider.envVar}}`);
      } else {
        // For custom endpoints, store the key directly in .env
        const envVarName = `${model.name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_KEY`;
        lines.push(`    api_key: $\{${envVarName}}`);
      }
    }

    // Optional fields
    if (model.api_base) lines.push(`    api_base: ${model.api_base}`);
    if (model.base_url) lines.push(`    base_url: ${model.base_url}`);
    if (model.gemini_api_key) {
      lines.push(`    gemini_api_key: $\{GEMINI_API_KEY}`);
    }
    if (model.max_tokens) lines.push(`    max_tokens: ${model.max_tokens}`);
    if (model.temperature !== undefined) lines.push(`    temperature: ${model.temperature}`);

    // Feature flags
    if (model.supports_thinking) {
      lines.push(`    supports_thinking: true`);
      lines.push(`    when_thinking_enabled:`);
      lines.push(`      extra_body:`);
      lines.push(`        thinking:`);
      lines.push(`          type: enabled`);
    }
    if (model.supports_vision) lines.push(`    supports_vision: true`);

    return lines.join("\n");
  }

  /**
   * Detect provider from the `use` field
   */
  private detectProvider(useClass: string): { provider: string; envVar: string } | null {
    const providerMap: Record<string, { provider: string; envVar: string }> = {
      "langchain_openai:ChatOpenAI": { provider: "openai", envVar: "OPENAI_API_KEY" },
      "langchain_anthropic:ChatAnthropic": { provider: "anthropic", envVar: "ANTHROPIC_API_KEY" },
      "langchain_google_genai:ChatGoogleGenerativeAI": { provider: "gemini", envVar: "GEMINI_API_KEY" },
      "deerflow.models.patched_deepseek:PatchedChatDeepSeek": { provider: "deepseek", envVar: "DEEPSEEK_API_KEY" },
    };

    return providerMap[useClass] || null;
  }

  /**
   * Save API key from model config to .env file
   */
  private saveApiKeyToEnv(model: Record<string, any>): void {
    const provider = this.detectProvider(model.use);

    if (model.api_key && provider?.envVar) {
      this.setEnvVariable(provider.envVar, model.api_key);
    }

    // Handle gemini_api_key separately
    if (model.gemini_api_key) {
      this.setEnvVariable("GEMINI_API_KEY", model.gemini_api_key);
    }
  }

  private getFilePath(filename: keyof typeof CONFIG_FILES): string {
    return path.join(this.projectRoot, CONFIG_FILES[filename]);
  }
}
