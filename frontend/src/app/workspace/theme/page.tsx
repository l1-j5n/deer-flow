"use client";

import { useEffect, useState } from "react";
import {
  CheckIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  RefreshCwIcon,
  SunIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme, useSaveTheme, useResetTheme, useThemePreview } from "@/core/theme";
import type { ThemeConfig, FontSize } from "@/core/theme/types";

type ThemeMode = "system" | "light" | "dark";

const THEME_MODES: { id: ThemeMode; label: string; description: string; icon: typeof SunIcon }[] = [
  { id: "system", label: "System", description: "Match your OS preference", icon: MonitorIcon },
  { id: "light", label: "Light", description: "Bright and clear", icon: SunIcon },
  { id: "dark", label: "Dark", description: "Easy on the eyes", icon: MoonIcon },
];

const ACCENT_COLORS = [
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Green", value: "#10b981", class: "bg-green-500" },
  { name: "Purple", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Orange", value: "#f59e0b", class: "bg-orange-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Slate", value: "#64748b", class: "bg-slate-500" },
];

const defaultConfig: ThemeConfig = {
  mode: "system",
  accentColor: "#3b82f6",
  fontSize: "medium",
  sidebarCollapsed: false,
  animationsEnabled: true,
};

export default function ThemePage() {
  const [localConfig, setLocalConfig] = useState(defaultConfig);
  const [localChange, setLocalChange] = useState(false);

  // Fetch theme from server
  const { data: themeData, isLoading: themeLoading } = useTheme();

  // Save/reset mutations
  const saveMutation = useSaveTheme();
  const resetMutation = useResetTheme();

  // Preview options
  const { data: preview } = useThemePreview();

  // Sync server data to local state when loaded
  useEffect(() => {
    if (themeData) {
      setLocalConfig((prev) => ({ ...prev, ...themeData }));
      applyTheme(themeData);
    }
  }, [themeData]);

  const applyTheme = (newConfig: typeof defaultConfig) => {
    const root = document.documentElement;

    // Apply mode
    if (newConfig.mode === "dark") {
      root.classList.add("dark");
    } else if (newConfig.mode === "light") {
      root.classList.remove("dark");
    } else {
      // System
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }

    // Apply accent color via CSS custom property
    root.style.setProperty("--accent-color", newConfig.accentColor);

    // Apply font size
    const fontSizeMap = { small: "14px", medium: "16px", large: "18px" };
    root.style.setProperty("--base-font-size", fontSizeMap[newConfig.fontSize as keyof typeof fontSizeMap]);

    // Apply animations
    if (!newConfig.animationsEnabled) {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.removeProperty("--animation-duration");
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(localConfig);
      applyTheme(localConfig);
      setLocalChange(true);
      setTimeout(() => setLocalChange(false), 2000);
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  const handleReset = async () => {
    try {
      const defaults = await resetMutation.mutateAsync();
      setLocalConfig(defaults);
      applyTheme(defaults);
    } catch (err) {
      console.error("Failed to reset theme:", err);
    }
  };

  const updateConfig = (partial: Partial<typeof defaultConfig>) => {
    const updated = { ...localConfig, ...partial };
    setLocalConfig(updated);
    applyTheme(updated);
    setLocalChange(true);
  };

  if (themeLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <PaletteIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Theme</h1>
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isPending = saveMutation.isPending || resetMutation.isPending;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PaletteIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Theme</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isPending}>
            <RefreshCwIcon className={`size-4 mr-2 ${isPending ? "animate-spin" : ""}`} />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending || !localChange}>
            {localChange ? (
              <>
                <CheckIcon className="size-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <CheckIcon className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how DeerFlow looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {THEME_MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = localConfig.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  className={`flex flex-col items-center gap-3 rounded-lg border p-4 transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => updateConfig({ mode: mode.id })}
                >
                  <Icon className={`size-8 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <span className="text-sm font-medium">{mode.label}</span>
                    <p className="text-muted-foreground text-xs">{mode.description}</p>
                  </div>
                  {isActive && (
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary">
                      <CheckIcon className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card>
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>Pick a color that matches your style</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => {
              const isActive = localConfig.accentColor === color.value;
              return (
                <button
                  key={color.value}
                  className={`group relative flex size-12 items-center justify-center rounded-full transition-transform hover:scale-110 ${color.class}`}
                  onClick={() => updateConfig({ accentColor: color.value })}
                  title={color.name}
                >
                  {isActive && (
                    <CheckIcon className="size-5 text-white" />
                  )}
                  <span className="sr-only">{color.name}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
            <Badge variant="outline" className="text-xs">
              {ACCENT_COLORS.find((c) => c.value === localConfig.accentColor)?.name ?? "Custom"}
            </Badge>
            <div
              className="size-4 rounded-full"
              style={{ backgroundColor: localConfig.accentColor }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>Adjust text size for readability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                className={`flex-1 rounded-lg border p-3 text-center transition-colors ${
                  localConfig.fontSize === size
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
                onClick={() => updateConfig({ fontSize: size as FontSize })}
              >
                <span
                  className="font-medium"
                  style={{
                    fontSize: size === "small" ? "14px" : size === "medium" ? "16px" : "18px",
                  }}
                >
                  Aa
                </span>
                <p className="text-muted-foreground text-xs mt-1 capitalize">{size}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your settings look</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="size-4 rounded-full"
                style={{ backgroundColor: localConfig.accentColor }}
              />
              <span className="text-sm font-medium">Accent color preview</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                style={{
                  backgroundColor: localConfig.accentColor,
                  color: "white",
                }}
              >
                Badge
              </Badge>
              <Button
                size="sm"
                style={{
                  backgroundColor: localConfig.accentColor,
                }}
              >
                Button
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This is how text looks with your selected settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}