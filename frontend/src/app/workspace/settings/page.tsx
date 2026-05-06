"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Monitor,
  Palette,
  Bell,
  Shield,
  Database,
  Globe,
  Keyboard,
  Info,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Laptop,
  RotateCcw,
  Save,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  useElectronSettings,
  useSaveSettings,
  useResetSettings,
  useAppInfo,
} from "@/core/electron-settings";
import type {
  GeneralSettings,
  AppearanceSettings,
  NotificationSettings,
  AdvancedSettings,
} from "@/core/electron-settings";

// ============================================================
// Constants
// ============================================================

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const SECTIONS: SettingsSection[] = [
  { id: "general", label: "settings.general", icon: Settings, description: "Language, startup, and behavior" },
  { id: "appearance", label: "settings.appearance", icon: Palette, description: "Theme, colors, and fonts" },
  { id: "notifications", label: "settings.notifications", icon: Bell, description: "Alerts and notification preferences" },
  { id: "security", label: "settings.security", icon: Shield, description: "Encryption and access control" },
  { id: "advanced", label: "settings.advanced", icon: Database, description: "Developer and performance options" },
  { id: "about", label: "settings.about", icon: Info, description: "Version and system information" },
];

const LANGUAGES = [
  { code: "zh-CN", name: "中文 (简体)", flag: "🇨🇳" },
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "ja-JP", name: "日本語", flag: "🇯🇵" },
  { code: "ko-KR", name: "한국어", flag: "🇰🇷" },
  { code: "de-DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr-FR", name: "Français", flag: "🇫🇷" },
];

const ACCENT_COLORS = [
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Slate", value: "#64748b", class: "bg-slate-500" },
];

const DEFAULT_GENERAL: GeneralSettings = {
  language: "zh-CN",
  startupBehavior: "restore",
  minimizeToTray: true,
  closeToTray: false,
  autoUpdate: true,
  telemetry: false,
};

const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  accentColor: "#3b82f6",
  fontSize: "medium",
  sidebarCollapsed: false,
  showAnimations: true,
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  desktopNotifications: true,
  emailNotifications: false,
  categories: {
    system: true,
    agent: true,
    workflow: true,
    security: true,
    mcp: false,
    update: true,
  },
};

const DEFAULT_ADVANCED: AdvancedSettings = {
  developerMode: false,
  debugLogging: false,
  cacheSize: 500,
  maxConcurrentTasks: 4,
  requestTimeout: 30,
};

// ============================================================
// Components
// ============================================================

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#2a2a2a] last:border-0">
      <div>
        <p className="text-sm text-gray-300">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative",
        checked ? "bg-blue-500" : "bg-[#333]"
      )}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full absolute top-1"
        animate={{ left: checked ? "22px" : "4px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  // ── React Query hooks ──────────────────────────────────────────
  const { data: serverSettings, isLoading } = useElectronSettings();
  const saveMutation = useSaveSettings();
  const resetMutation = useResetSettings();
  const { data: appInfo } = useAppInfo();

  // ── Local state — synced from server on load ─────────────────
  const [general, setGeneral] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);

  // Sync local state from server when data arrives
  useEffect(() => {
    if (serverSettings) {
      setGeneral({ ...DEFAULT_GENERAL, ...serverSettings.general });
      setAppearance({ ...DEFAULT_APPEARANCE, ...serverSettings.appearance });
      setNotifications({ ...DEFAULT_NOTIFICATIONS, ...serverSettings.notifications });
      setAdvanced({ ...DEFAULT_ADVANCED, ...serverSettings.advanced });
      setHasChanges(false);
    }
  }, [serverSettings]);

  // ── Save ──────────────────────────────────────────────────────

  const applyTheme = useCallback((appearanceData: AppearanceSettings) => {
    const root = document.documentElement;
    if (appearanceData.theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (appearanceData.theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    }
    root.style.setProperty("--accent-color", appearanceData.accentColor);
    const fontSizeMap: Record<string, string> = { small: "14px", medium: "16px", large: "18px" };
    root.style.setProperty("--base-font-size", fontSizeMap[appearanceData.fontSize] ?? "16px");
  }, []);

  const handleSave = useCallback(() => {
    applyTheme(appearance);
    setHasChanges(false);
    saveMutation.mutate({ general, appearance, notifications, advanced });
  }, [general, appearance, notifications, advanced, applyTheme, saveMutation]);

  const handleReset = useCallback(() => {
    setGeneral(DEFAULT_GENERAL);
    setAppearance(DEFAULT_APPEARANCE);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setAdvanced(DEFAULT_ADVANCED);
    setHasChanges(true);
    resetMutation.mutate();
    applyTheme(DEFAULT_APPEARANCE);
  }, [resetMutation, applyTheme]);

  // ── Update helpers ────────────────────────────────────────────

  const updateGeneral = (partial: Partial<GeneralSettings>) => {
    setGeneral((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  };
  const updateAppearance = (partial: Partial<AppearanceSettings>) => {
    setAppearance((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  };
  const updateNotifications = (partial: Partial<NotificationSettings>) => {
    setNotifications((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  };
  const updateAdvanced = (partial: Partial<AdvancedSettings>) => {
    setAdvanced((prev) => ({ ...prev, ...partial }));
    setHasChanges(true);
  };

  const handleLanguageChange = (lang: string) => {
    updateGeneral({ language: lang });
    i18n.changeLanguage(lang);
  };

  // ── Build about section info ─────────────────────────────────

  const aboutLines = useMemo(() => {
    if (!appInfo) return null;
    return [
      { label: "App Version", value: appInfo.appVersion },
      { label: "Electron", value: appInfo.electronVersion },
      { label: "Node.js", value: appInfo.nodeVersion },
      { label: "Python", value: appInfo.pythonVersion },
      { label: "Platform", value: `${appInfo.platform} (${appInfo.arch})` },
    ];
  }, [appInfo]);

  // ── Loading skeleton ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-semibold text-white">{t("settings.title")}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading settings…</span>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-semibold text-white">{t("settings.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-xs text-yellow-500 mr-2"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("settings.unsaved")}
              </motion.div>
            </AnimatePresence>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-xs transition-colors"
          >
            {saveMutation.isPending ? (
              <motion.div
                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {t("settings.save")}
          </button>
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333] hover:bg-[#444] disabled:opacity-50 text-gray-300 rounded-md text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("settings.reset")}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-[#2a2a2a] p-3 space-y-0.5 overflow-y-auto">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm transition-colors",
                  isActive
                    ? "bg-blue-500/15 text-blue-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1">{t(section.label)}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* General */}
              {activeSection === "general" && (
                <div>
                  <SectionHeader icon={Settings} title={t("settings.general")} description="Language, startup, and behavior" />

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                    <SettingRow label={t("settings.language")} description="Interface display language">
                      <select
                        value={general.language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-[#252525] border border-[#333] text-gray-300 rounded-md px-2 py-1.5 text-xs"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </SettingRow>

                    <SettingRow label={t("settings.startup")} description="Behavior when app launches">
                      <select
                        value={general.startupBehavior}
                        onChange={(e) => updateGeneral({ startupBehavior: e.target.value as GeneralSettings["startupBehavior"] })}
                        className="bg-[#252525] border border-[#333] text-gray-300 rounded-md px-2 py-1.5 text-xs"
                      >
                        <option value="restore">{t("settings.startup.restore")}</option>
                        <option value="newChat">{t("settings.startup.newChat")}</option>
                        <option value="dashboard">{t("settings.startup.dashboard")}</option>
                      </select>
                    </SettingRow>

                    <SettingRow label={t("settings.minimizeToTray")} description="Minimize to system tray instead of taskbar">
                      <Toggle checked={general.minimizeToTray} onChange={(v) => updateGeneral({ minimizeToTray: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.closeToTray")} description="Close button minimizes to tray">
                      <Toggle checked={general.closeToTray} onChange={(v) => updateGeneral({ closeToTray: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.autoUpdate")} description="Automatically check for and install updates">
                      <Toggle checked={general.autoUpdate} onChange={(v) => updateGeneral({ autoUpdate: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.telemetry")} description="Send anonymous usage data to help improve DeerFlow">
                      <Toggle checked={general.telemetry} onChange={(v) => updateGeneral({ telemetry: v })} />
                    </SettingRow>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeSection === "appearance" && (
                <div>
                  <SectionHeader icon={Palette} title={t("settings.appearance")} description="Theme, colors, and fonts" />

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                    <SettingRow label={t("settings.theme")} description="Color mode preference">
                      <div className="flex gap-1">
                        {(["system", "light", "dark"] as const).map((theme) => {
                          const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Laptop;
                          const isSelected = appearance.theme === theme;
                          return (
                            <button
                              key={theme}
                              onClick={() => updateAppearance({ theme })}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors",
                                isSelected
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                  : "bg-[#252525] text-gray-400 border border-[#333] hover:border-[#555]"
                              )}
                            >
                              <Icon className="w-3 h-3" />
                              {t(`settings.theme.${theme}`)}
                            </button>
                          );
                        })}
                      </div>
                    </SettingRow>

                    <SettingRow label={t("settings.accent")} description="Primary accent color for UI elements">
                      <div className="flex gap-1.5">
                        {ACCENT_COLORS.map((accent) => (
                          <button
                            key={accent.value}
                            onClick={() => updateAppearance({ accentColor: accent.value })}
                            className={cn(
                              "w-6 h-6 rounded-full transition-transform hover:scale-110",
                              accent.class,
                              appearance.accentColor === accent.value && "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]"
                            )}
                            title={accent.name}
                          />
                        ))}
                      </div>
                    </SettingRow>

                    <SettingRow label={t("settings.fontSize")} description="Base font size">
                      <select
                        value={appearance.fontSize}
                        onChange={(e) => updateAppearance({ fontSize: e.target.value as AppearanceSettings["fontSize"] })}
                        className="bg-[#252525] border border-[#333] text-gray-300 rounded-md px-2 py-1.5 text-xs"
                      >
                        <option value="small">{t("settings.fontSize.small")}</option>
                        <option value="medium">{t("settings.fontSize.medium")}</option>
                        <option value="large">{t("settings.fontSize.large")}</option>
                      </select>
                    </SettingRow>

                    <SettingRow label={t("settings.sidebar")} description="Sidebar starts collapsed">
                      <Toggle checked={appearance.sidebarCollapsed} onChange={(v) => updateAppearance({ sidebarCollapsed: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.animations")} description="Enable transition animations">
                      <Toggle checked={appearance.showAnimations} onChange={(v) => updateAppearance({ showAnimations: v })} />
                    </SettingRow>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <div>
                  <SectionHeader icon={Bell} title={t("settings.notifications")} description="Alerts and notification preferences" />

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                    <SettingRow label={t("settings.notifications.enabled")} description="Enable all notifications">
                      <Toggle checked={notifications.enabled} onChange={(v) => updateNotifications({ enabled: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.notifications.sound")} description="Play a sound for new notifications">
                      <Toggle checked={notifications.soundEnabled} onChange={(v) => updateNotifications({ soundEnabled: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.notifications.desktop")} description="Show desktop push notifications">
                      <Toggle checked={notifications.desktopNotifications} onChange={(v) => updateNotifications({ desktopNotifications: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.notifications.email")} description="Also send notifications via email">
                      <Toggle checked={notifications.emailNotifications} onChange={(v) => updateNotifications({ emailNotifications: v })} />
                    </SettingRow>

                    <div className="py-3 border-b border-[#2a2a2a]">
                      <p className="text-sm text-gray-300 mb-2">{t("settings.notifications.categories")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(notifications.categories).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-1 px-2 bg-[#252525] rounded">
                            <span className="text-xs text-gray-400 capitalize">{key}</span>
                            <Toggle
                              checked={value}
                              onChange={(v) =>
                                updateNotifications({
                                  categories: { ...notifications.categories, [key]: v },
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeSection === "security" && (
                <div>
                  <SectionHeader icon={Shield} title={t("settings.security")} description="Encryption and access control" />

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                    <SettingRow label={t("settings.security.encryption")} description="AES-256-GCM encryption for local data">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">{t("settings.security.enabled")}</span>
                      </div>
                    </SettingRow>

                    <SettingRow label={t("settings.security.rateLimit")} description="API rate limiting (100 req/60s window)">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">{t("settings.security.enabled")}</span>
                      </div>
                    </SettingRow>

                    <SettingRow label={t("settings.security.sanitize")} description="Input and path sanitization enabled">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">{t("settings.security.enabled")}</span>
                      </div>
                    </SettingRow>

                    <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                      <p className="text-xs text-gray-500">
                        {t("settings.security.note")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced */}
              {activeSection === "advanced" && (
                <div>
                  <SectionHeader icon={Database} title={t("settings.advanced")} description="Developer and performance options" />

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                    <SettingRow label={t("settings.advanced.developer")} description="Enable developer tools and debug panels">
                      <Toggle checked={advanced.developerMode} onChange={(v) => updateAdvanced({ developerMode: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.advanced.debugLogging")} description="Write verbose debug logs to disk">
                      <Toggle checked={advanced.debugLogging} onChange={(v) => updateAdvanced({ debugLogging: v })} />
                    </SettingRow>

                    <SettingRow label={t("settings.advanced.cacheSize")} description="Maximum memory cache in MB">
                      <input
                        type="number"
                        min={50}
                        max={5000}
                        step={50}
                        value={advanced.cacheSize}
                        onChange={(e) => updateAdvanced({ cacheSize: Number(e.target.value) || 500 })}
                        className="w-24 bg-[#252525] border border-[#333] text-gray-300 rounded-md px-2 py-1.5 text-xs"
                      />
                    </SettingRow>

                    <SettingRow label={t("settings.advanced.maxConcurrent")} description="Max concurrent agent tasks">
                      <input
                        type="number"
                        min={1}
                        max={32}
                        value={advanced.maxConcurrentTasks}
                        onChange={(e) => updateAdvanced({ maxConcurrentTasks: Number(e.target.value) || 4 })}
                        className="w-20 bg-[#252525] border border-[#333] text-gray-300 rounded-md px-2 py-1.5 text-xs"
                      />
                    </SettingRow>

                    <SettingRow label={t("settings.advanced.requestTimeout")} description="Agent request timeout in seconds">
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={advanced.requestTimeout}
                        onChange={(e) => updateAdvanced({ requestTimeout: Number(e.target.value) || 30 })}
                        className="w-20 bg-[#252525] border border-[#333] text-gray-300 rounded-md px-2 py-1.5 text-xs"
                      />
                    </SettingRow>
                  </div>
                </div>
              )}

              {/* About */}
              {activeSection === "about" && (
                <div>
                  <SectionHeader icon={Info} title={t("settings.about")} description="Version and system information" />

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">DeerFlow Agent Platform</h3>
                        <p className="text-sm text-gray-400">Intelligent Agent Workspace</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {aboutLines ? (
                        aboutLines.map((line) => (
                          <div key={line.label} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                            <span className="text-sm text-gray-400">{line.label}</span>
                            <code className="text-xs text-gray-300 bg-[#252525] px-2 py-0.5 rounded">{line.value}</code>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Loading system information…</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
