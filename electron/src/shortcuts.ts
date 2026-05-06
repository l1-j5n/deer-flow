/**
 * DeerFlow Electron - Keyboard Shortcuts Manager
 *
 * Manages customizable keyboard shortcuts:
 * - Default shortcuts for common actions
 * - User customization via settings
 * - Persistence to user data directory
 * - Conflict detection
 * - Platform-aware key mapping (Cmd vs Ctrl)
 */

import * as fs from "fs";
import * as path from "path";

export interface ShortcutConfig {
  action: string;
  label: string;
  defaultAccelerator: string;
  customAccelerator?: string;
  category: "navigation" | "view" | "service" | "window";
  description: string;
}

export interface ShortcutsFile {
  version: number;
  shortcuts: Record<string, string>; // action -> accelerator
  updatedAt: string;
}

export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  {
    action: "new-chat",
    label: "New Chat",
    defaultAccelerator: "CmdOrCtrl+N",
    category: "navigation",
    description: "Start a new chat session",
  },
  {
    action: "toggle-sidebar",
    label: "Toggle Sidebar",
    defaultAccelerator: "CmdOrCtrl+B",
    category: "view",
    description: "Show or hide the sidebar",
  },
  {
    action: "open-settings",
    label: "Open Settings",
    defaultAccelerator: "CmdOrCtrl+",
    category: "navigation",
    description: "Open the settings window",
  },
  {
    action: "service-status",
    label: "Service Status",
    defaultAccelerator: "CmdOrCtrl+Shift+S",
    category: "service",
    description: "Open the service status dashboard",
  },
  {
    action: "reload",
    label: "Reload",
    defaultAccelerator: "CmdOrCtrl+R",
    category: "view",
    description: "Reload the current page",
  },
  {
    action: "force-reload",
    label: "Force Reload",
    defaultAccelerator: "CmdOrCtrl+Shift+R",
    category: "view",
    description: "Reload ignoring cache",
  },
  {
    action: "toggle-devtools",
    label: "Toggle DevTools",
    defaultAccelerator: "F12",
    category: "view",
    description: "Open or close developer tools",
  },
  {
    action: "zoom-in",
    label: "Zoom In",
    defaultAccelerator: "CmdOrCtrl+=",
    category: "view",
    description: "Increase zoom level",
  },
  {
    action: "zoom-out",
    label: "Zoom Out",
    defaultAccelerator: "CmdOrCtrl+-",
    category: "view",
    description: "Decrease zoom level",
  },
  {
    action: "reset-zoom",
    label: "Reset Zoom",
    defaultAccelerator: "CmdOrCtrl+0",
    category: "view",
    description: "Reset zoom to default",
  },
  {
    action: "quit",
    label: "Quit",
    defaultAccelerator: "CmdOrCtrl+Q",
    category: "window",
    description: "Quit DeerFlow",
  },
  {
    action: "diagnostics",
    label: "Open Diagnostics",
    defaultAccelerator: "CmdOrCtrl+Shift+D",
    category: "service",
    description: "Open the diagnostics dashboard",
  },
];

const SHORTCUTS_FILENAME = "shortcuts.json";
const FILE_VERSION = 1;

export class ShortcutsManager {
  private userDataPath: string;
  private customShortcuts: Map<string, string> = new Map();

  constructor(userDataPath: string) {
    this.userDataPath = userDataPath;
    this.loadCustomShortcuts();
  }

  /**
   * Get the path to the shortcuts config file
   */
  private getConfigPath(): string {
    return path.join(this.userDataPath, SHORTCUTS_FILENAME);
  }

  /**
   * Load custom shortcuts from disk
   */
  private loadCustomShortcuts(): void {
    try {
      const configPath = this.getConfigPath();
      if (!fs.existsSync(configPath)) {
        return;
      }

      const data = fs.readFileSync(configPath, "utf-8");
      const parsed: ShortcutsFile = JSON.parse(data);

      if (parsed.version === FILE_VERSION && parsed.shortcuts) {
        for (const [action, accelerator] of Object.entries(parsed.shortcuts)) {
          this.customShortcuts.set(action, accelerator);
        }
      }
    } catch (err) {
      console.warn("[ShortcutsManager] Failed to load custom shortcuts:", err);
    }
  }

  /**
   * Save custom shortcuts to disk
   */
  private saveCustomShortcuts(): void {
    try {
      const configPath = this.getConfigPath();
      const data: ShortcutsFile = {
        version: FILE_VERSION,
        shortcuts: Object.fromEntries(this.customShortcuts),
        updatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("[ShortcutsManager] Failed to save custom shortcuts:", err);
    }
  }

  /**
   * Get all shortcuts with their current accelerators
   */
  getAllShortcuts(): ShortcutConfig[] {
    return DEFAULT_SHORTCUTS.map((shortcut) => ({
      ...shortcut,
      customAccelerator: this.customShortcuts.get(shortcut.action),
    }));
  }

  /**
   * Get the effective accelerator for an action
   */
  getAccelerator(action: string): string | undefined {
    const custom = this.customShortcuts.get(action);
    if (custom) return custom;

    const defaultShortcut = DEFAULT_SHORTCUTS.find((s) => s.action === action);
    return defaultShortcut?.defaultAccelerator;
  }

  /**
   * Set a custom accelerator for an action
   */
  setCustomShortcut(action: string, accelerator: string): { success: boolean; error?: string } {
    // Validate action exists
    const shortcut = DEFAULT_SHORTCUTS.find((s) => s.action === action);
    if (!shortcut) {
      return { success: false, error: `Unknown action: ${action}` };
    }

    // Validate accelerator format
    if (!this.isValidAccelerator(accelerator)) {
      return { success: false, error: "Invalid accelerator format" };
    }

    // Check for conflicts
    const conflict = this.findConflict(action, accelerator);
    if (conflict) {
      return {
        success: false,
        error: `Conflicts with: ${conflict.label} (${conflict.action})`,
      };
    }

    // If same as default, remove custom
    if (accelerator === shortcut.defaultAccelerator) {
      this.customShortcuts.delete(action);
    } else {
      this.customShortcuts.set(action, accelerator);
    }

    this.saveCustomShortcuts();
    return { success: true };
  }

  /**
   * Reset a shortcut to its default
   */
  resetShortcut(action: string): { success: boolean; error?: string } {
    if (!DEFAULT_SHORTCUTS.find((s) => s.action === action)) {
      return { success: false, error: `Unknown action: ${action}` };
    }

    this.customShortcuts.delete(action);
    this.saveCustomShortcuts();
    return { success: true };
  }

  /**
   * Reset all shortcuts to defaults
   */
  resetAll(): void {
    this.customShortcuts.clear();
    this.saveCustomShortcuts();
  }

  /**
   * Find a conflicting shortcut
   */
  private findConflict(
    action: string,
    accelerator: string
  ): ShortcutConfig | undefined {
    for (const shortcut of DEFAULT_SHORTCUTS) {
      if (shortcut.action === action) continue;

      const otherAccel =
        this.customShortcuts.get(shortcut.action) ||
        shortcut.defaultAccelerator;

      if (otherAccel === accelerator) {
        return shortcut;
      }
    }
    return undefined;
  }

  /**
   * Validate accelerator format
   */
  private isValidAccelerator(accelerator: string): boolean {
    if (!accelerator || accelerator.trim().length === 0) {
      return false;
    }

    // Valid modifiers
    const modifiers = ["Cmd", "Ctrl", "CmdOrCtrl", "Alt", "Shift", "Super"];
    const validKeys = [
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
      ..."0123456789".split(""),
      "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
      "F13", "F14", "F15", "F16", "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24",
      "Plus", "Space", "Tab", "Backspace", "Delete", "Insert", "Return", "Enter",
      "Up", "Down", "Left", "Right", "Home", "End", "PageUp", "PageDown",
      "Escape", "Esc", "VolumeUp", "VolumeDown", "VolumeMute",
    ];

    const parts = accelerator.split("+");
    const key = parts[parts.length - 1];

    // Check if key is valid
    if (!validKeys.includes(key)) {
      return false;
    }

    // Check modifiers
    for (let i = 0; i < parts.length - 1; i++) {
      if (!modifiers.includes(parts[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Convert accelerator to display-friendly format
   */
  static formatAccelerator(accelerator: string, platform?: string): string {
    const isMac = platform === "darwin" || process.platform === "darwin";
    return accelerator
      .replace("CmdOrCtrl", isMac ? "⌘" : "Ctrl")
      .replace("Cmd", "⌘")
      .replace("Ctrl", "Ctrl")
      .replace("Alt", isMac ? "⌥" : "Alt")
      .replace("Shift", isMac ? "⇧" : "Shift")
      .replace("+", isMac ? "" : "+");
  }

  /**
   * Get shortcuts grouped by category
   */
  getShortcutsByCategory(): Record<string, ShortcutConfig[]> {
    const grouped: Record<string, ShortcutConfig[]> = {};

    for (const shortcut of this.getAllShortcuts()) {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    }

    return grouped;
  }
}

/**
 * Generate the shortcuts customization HTML
 */
export function getShortcutsHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Keyboard Shortcuts</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #333;
    }

    .header h1 {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #818cf8, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: transparent;
      color: #888;
      border: 1px solid #444;
    }

    .btn-secondary:hover { border-color: #666; color: #ccc; }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }

    .btn-primary:hover { opacity: 0.9; }

    /* Category sections */
    .category {
      margin-bottom: 2rem;
    }

    .category-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }

    .shortcut-list {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid #333;
      border-radius: 10px;
      overflow: hidden;
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      transition: background 0.2s;
    }

    .shortcut-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .shortcut-item:last-child { border-bottom: none; }

    .shortcut-info {
      flex: 1;
    }

    .shortcut-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: #e5e5e5;
    }

    .shortcut-desc {
      font-size: 0.75rem;
      color: #666;
      margin-top: 0.15rem;
    }

    .shortcut-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .shortcut-input {
      width: 180px;
      padding: 0.4rem 0.6rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid #444;
      border-radius: 6px;
      color: #e5e5e5;
      font-size: 0.8rem;
      font-family: monospace;
      text-align: center;
      outline: none;
      cursor: pointer;
    }

    .shortcut-input:focus {
      border-color: #6366f1;
    }

    .shortcut-input.recording {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .shortcut-reset {
      background: transparent;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
    }

    .shortcut-reset:hover { color: #ef4444; }

    .shortcut-modified {
      color: #6366f1;
      font-size: 0.7rem;
      margin-left: 0.5rem;
    }

    /* Conflict warning */
    .conflict-warning {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>⌨️ Keyboard Shortcuts</h1>
    <button class="btn btn-secondary" onclick="resetAll()">Reset All</button>
  </div>

  <div id="content">
    <div style="text-align: center; padding: 3rem; color: #666;">
      Loading shortcuts...
    </div>
  </div>

  <script>
    let shortcuts = [];
    let recordingAction = null;

    async function loadShortcuts() {
      shortcuts = await window.electronAPI.shortcuts.getAll();
      renderShortcuts();
    }

    function renderShortcuts() {
      const categories = {};
      for (const s of shortcuts) {
        if (!categories[s.category]) categories[s.category] = [];
        categories[s.category].push(s);
      }

      const categoryNames = {
        navigation: 'Navigation',
        view: 'View',
        service: 'Services',
        window: 'Window'
      };

      let html = '';
      for (const [cat, items] of Object.entries(categories)) {
        html += '<div class="category">';
        html += '<div class="category-title">' + (categoryNames[cat] || cat) + '</div>';
        html += '<div class="shortcut-list">';
        for (const s of items) {
          const isModified = s.customAccelerator && s.customAccelerator !== s.defaultAccelerator;
          const displayValue = s.customAccelerator || s.defaultAccelerator;
          html += '<div class="shortcut-item">';
          html += '<div class="shortcut-info">';
          html += '<div class="shortcut-name">' + s.label + (isModified ? '<span class="shortcut-modified">(modified)</span>' : '') + '</div>';
          html += '<div class="shortcut-desc">' + s.description + '</div>';
          html += '</div>';
          html += '<div class="shortcut-input-group">';
          html += '<input type="text" class="shortcut-input' + (recordingAction === s.action ? ' recording' : '') + '"';
          html += ' value="' + displayValue + '"';
          html += ' readonly';
          html += ' placeholder="Click to record"';
          html += ' onclick="startRecording(\'' + s.action + '\')"';
          html += ' onkeydown="handleKeyDown(event, \'' + s.action + '\')"';
          html += ' id="input-' + s.action + '"';
          html += '>';
          if (isModified) {
            html += '<button class="shortcut-reset" onclick="resetShortcut(\'' + s.action + '\')">↺</button>';
          }
          html += '</div>';
          html += '</div>';
        }
        html += '</div></div>';
      }

      document.getElementById('content').innerHTML = html;
    }

    function startRecording(action) {
      recordingAction = action;
      renderShortcuts();
      const input = document.getElementById('input-' + action);
      if (input) input.focus();
    }

    function handleKeyDown(event, action) {
      event.preventDefault();
      event.stopPropagation();

      if (!recordingAction || recordingAction !== action) return;

      // Cancel on Escape
      if (event.key === 'Escape') {
        recordingAction = null;
        renderShortcuts();
        return;
      }

      // Build accelerator string
      const parts = [];
      if (event.ctrlKey) parts.push('Ctrl');
      if (event.metaKey) parts.push('Cmd');
      if (event.altKey) parts.push('Alt');
      if (event.shiftKey) parts.push('Shift');

      let key = event.key;
      if (key === ' ') key = 'Space';
      if (key.length === 1) key = key.toUpperCase();

      // Don't record modifier-only
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return;

      parts.push(key);
      const accelerator = parts.join('+');

      recordingAction = null;
      saveShortcut(action, accelerator);
    }

    async function saveShortcut(action, accelerator) {
      const result = await window.electronAPI.shortcuts.set(action, accelerator);
      if (result.success) {
        await loadShortcuts();
      } else {
        alert('Failed to set shortcut: ' + result.error);
        await loadShortcuts();
      }
    }

    async function resetShortcut(action) {
      await window.electronAPI.shortcuts.reset(action);
      await loadShortcuts();
    }

    async function resetAll() {
      if (confirm('Reset all shortcuts to defaults?')) {
        await window.electronAPI.shortcuts.resetAll();
        await loadShortcuts();
      }
    }

    loadShortcuts();
  </script>
</body>
</html>`;
}
