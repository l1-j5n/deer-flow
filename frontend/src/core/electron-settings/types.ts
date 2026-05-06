/* ── Electron Workspace Settings data types ── */

export interface GeneralSettings {
  language: string;
  startupBehavior: "restore" | "newChat" | "dashboard";
  minimizeToTray: boolean;
  closeToTray: boolean;
  autoUpdate: boolean;
  telemetry: boolean;
}

export interface AppearanceSettings {
  theme: "system" | "light" | "dark";
  accentColor: string;
  fontSize: "small" | "medium" | "large";
  sidebarCollapsed: boolean;
  showAnimations: boolean;
}

export interface NotificationCategories {
  system: boolean;
  agent: boolean;
  workflow: boolean;
  security: boolean;
  mcp: boolean;
  update: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  categories: NotificationCategories;
}

export interface AdvancedSettings {
  developerMode: boolean;
  debugLogging: boolean;
  cacheSize: number;
  maxConcurrentTasks: number;
  requestTimeout: number;
}

export interface ElectronSettings {
  general: GeneralSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  advanced: AdvancedSettings;
}

export interface SettingsUpdate {
  general?: Partial<GeneralSettings>;
  appearance?: Partial<AppearanceSettings>;
  notifications?: Partial<NotificationSettings>;
  advanced?: Partial<AdvancedSettings>;
}

export interface AppInfo {
  appVersion: string;
  electronVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  pythonVersion: string;
}
