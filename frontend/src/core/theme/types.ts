/**
 * Theme types for DeerFlow Electron platform.
 */

export type ThemeMode = "system" | "light" | "dark";

export type FontSize = "small" | "medium" | "large";

export interface ThemeAccentColor {
  name: string;
  value: string;
  class_name: string;
}

export interface ThemeModeOption {
  id: ThemeMode;
  label: string;
  description: string;
}

export interface ThemeFontSizeOption {
  id: FontSize;
  label: string;
  value_px: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  accentColor: string;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
}

export interface ThemePreview {
  modes: ThemeModeOption[];
  accent_colors: ThemeAccentColor[];
  font_sizes: ThemeFontSizeOption[];
  defaults: ThemeConfig;
}

export interface ThemeStats {
  total_users: number;
  mode_distribution: Record<string, number>;
  accent_distribution: Record<string, number>;
  font_size_distribution: Record<string, number>;
}