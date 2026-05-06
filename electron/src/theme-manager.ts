/**
 * DeerFlow Electron - Theme Manager
 *
 * Manages application theme (light/dark/auto) with:
 * - System theme detection
 * - User preference persistence
 * - CSS injection for consistent theming
 * - Theme change events
 */

import * as fs from "fs";
import * as path from "path";

export type ThemeMode = "light" | "dark" | "auto";

export interface ThemeConfig {
  mode: ThemeMode;
  accentColor?: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  error: string;
}

const THEME_FILENAME = "theme.json";

const THEMES: Record<string, ThemeColors> = {
  dark: {
    background: "#0a0a0a",
    surface: "#1a1a1a",
    border: "#333333",
    text: "#e5e5e5",
    textSecondary: "#888888",
    accent: "#6366f1",
    accentHover: "#4f46e5",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  light: {
    background: "#fafafa",
    surface: "#ffffff",
    border: "#e5e5e5",
    text: "#1a1a1a",
    textSecondary: "#666666",
    accent: "#4f46e5",
    accentHover: "#4338ca",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
  },
};

export class ThemeManager {
  private userDataPath: string;
  private config: ThemeConfig;
  private systemTheme: "light" | "dark" = "dark";

  constructor(userDataPath: string) {
    this.userDataPath = userDataPath;
    this.config = this.loadConfig();
    this.detectSystemTheme();
  }

  /**
   * Get the path to the theme config file
   */
  private getConfigPath(): string {
    return path.join(this.userDataPath, THEME_FILENAME);
  }

  /**
   * Load theme config from disk
   */
  private loadConfig(): ThemeConfig {
    try {
      const configPath = this.getConfigPath();
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        if (data.mode && ["light", "dark", "auto"].includes(data.mode)) {
          return { mode: data.mode, accentColor: data.accentColor };
        }
      }
    } catch (err) {
      console.warn("[ThemeManager] Failed to load theme config:", err);
    }
    return { mode: "dark" };
  }

  /**
   * Save theme config to disk
   */
  private saveConfig(): void {
    try {
      fs.writeFileSync(
        this.getConfigPath(),
        JSON.stringify(this.config, null, 2),
        "utf-8"
      );
    } catch (err) {
      console.warn("[ThemeManager] Failed to save theme config:", err);
    }
  }

  /**
   * Detect system theme preference
   */
  private detectSystemTheme(): void {
    try {
      // On macOS/Windows, check native theme
      const { nativeTheme } = require("electron");
      if (nativeTheme) {
        this.systemTheme = nativeTheme.shouldUseDarkColors ? "dark" : "light";

        nativeTheme.on("updated", () => {
          this.systemTheme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
          if (this.config.mode === "auto") {
            this.emitThemeChanged();
          }
        });
      }
    } catch {
      // Fallback: assume dark
      this.systemTheme = "dark";
    }
  }

  /**
   * Get the effective theme (resolved from auto if needed)
   */
  getEffectiveTheme(): "light" | "dark" {
    if (this.config.mode === "auto") {
      return this.systemTheme;
    }
    return this.config.mode;
  }

  /**
   * Get current theme mode
   */
  getMode(): ThemeMode {
    return this.config.mode;
  }

  /**
   * Set theme mode
   */
  setMode(mode: ThemeMode): void {
    this.config.mode = mode;
    this.saveConfig();
    this.emitThemeChanged();
  }

  /**
   * Get theme colors
   */
  getColors(): ThemeColors {
    const theme = this.getEffectiveTheme();
    return THEMES[theme];
  }

  /**
   * Generate CSS variables for the current theme
   */
  generateCSSVariables(): string {
    const colors = this.getColors();
    return `
      :root {
        --df-bg: ${colors.background};
        --df-surface: ${colors.surface};
        --df-border: ${colors.border};
        --df-text: ${colors.text};
        --df-text-secondary: ${colors.textSecondary};
        --df-accent: ${colors.accent};
        --df-accent-hover: ${colors.accentHover};
        --df-success: ${colors.success};
        --df-warning: ${colors.warning};
        --df-error: ${colors.error};
      }
    `;
  }

  /**
   * Get theme-aware window background color
   */
  getBackgroundColor(): string {
    return this.getColors().background;
  }

  /**
   * Toggle between light and dark (skips auto)
   */
  toggle(): void {
    const current = this.getEffectiveTheme();
    this.setMode(current === "dark" ? "light" : "dark");
  }

  /**
   * Emit theme change event (to be overridden by consumer)
   */
  private emitThemeChanged(): void {
    // This will be connected to main.ts IPC
    if ((this as any).onThemeChanged) {
      (this as any).onThemeChanged(this.getEffectiveTheme());
    }
  }

  /**
   * Get theme config for IPC response
   */
  getConfig(): ThemeConfig {
    return { ...this.config };
  }
}
