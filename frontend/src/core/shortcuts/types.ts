/** Shortcuts type definitions. */

export interface Shortcut {
  id: string;
  action: string;
  description: string;
  category: string;
  keyCombo: string;
  defaultKeyCombo: string;
  isCustom: boolean;
}

export interface ShortcutListResponse {
  shortcuts: Shortcut[];
  total: number;
}

export interface ShortcutStats {
  totalShortcuts: number;
  customShortcuts: number;
  defaultShortcuts: number;
  categories: Record<string, number>;
}