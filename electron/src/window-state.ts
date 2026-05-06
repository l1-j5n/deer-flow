/**
 * DeerFlow Electron - Window State Persistence
 *
 * Saves and restores window position, size, and maximized state
 * between application sessions. Uses app.getPath('userData') for storage.
 */

import * as fs from "fs";
import * as path from "path";

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

interface WindowStateFile {
  bounds: {
    x?: number;
    y?: number;
    width: number;
    height: number;
  };
  isMaximized: boolean;
}

const STATE_FILENAME = "window-state.json";

/**
 * Get the path to the window state file
 */
function getStateFilePath(userDataPath: string): string {
  return path.join(userDataPath, STATE_FILENAME);
}

/**
 * Load saved window state from disk
 */
export function loadWindowState(userDataPath: string): WindowState {
  const defaultState: WindowState = {
    width: 1400,
    height: 900,
    isMaximized: false,
  };

  try {
    const statePath = getStateFilePath(userDataPath);
    if (!fs.existsSync(statePath)) {
      return defaultState;
    }

    const data = fs.readFileSync(statePath, "utf-8");
    const saved: WindowStateFile = JSON.parse(data);

    // Validate the saved state has reasonable bounds
    if (
      saved.bounds &&
      typeof saved.bounds.width === "number" &&
      typeof saved.bounds.height === "number" &&
      saved.bounds.width >= 400 &&
      saved.bounds.height >= 300
    ) {
      return {
        x: saved.bounds.x,
        y: saved.bounds.y,
        width: saved.bounds.width,
        height: saved.bounds.height,
        isMaximized: saved.isMaximized || false,
      };
    }
  } catch (err) {
    console.warn("[WindowState] Failed to load state:", err);
  }

  return defaultState;
}

/**
 * Save window state to disk
 */
export function saveWindowState(
  userDataPath: string,
  state: WindowState
): void {
  try {
    const statePath = getStateFilePath(userDataPath);
    const data: WindowStateFile = {
      bounds: {
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
      },
      isMaximized: state.isMaximized,
    };

    // Ensure userData directory exists
    const dir = path.dirname(statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(statePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[WindowState] Failed to save state:", err);
  }
}

/**
 * Track a BrowserWindow's state and save it on changes
 * Returns the loaded initial state
 */
export function createWindowStateTracker(
  userDataPath: string
): {
  getInitialState: () => WindowState;
  track: (browserWindow: Electron.BrowserWindow) => void;
  flush: () => void;
} {
  let currentState = loadWindowState(userDataPath);
  let saveTimer: NodeJS.Timeout | null = null;

  function scheduleSave(): void {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveWindowState(userDataPath, currentState);
      saveTimer = null;
    }, 500); // Debounce 500ms
  }

  return {
    getInitialState: () => ({ ...currentState }),

    track: (win: Electron.BrowserWindow) => {
      win.on("resize", () => {
        if (!win.isMaximized() && !win.isMinimized()) {
          const bounds = win.getBounds();
          currentState = {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            isMaximized: false,
          };
          scheduleSave();
        }
      });

      win.on("move", () => {
        if (!win.isMaximized() && !win.isMinimized()) {
          const bounds = win.getBounds();
          currentState = {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            isMaximized: false,
          };
          scheduleSave();
        }
      });

      win.on("maximize", () => {
        currentState.isMaximized = true;
        scheduleSave();
      });

      win.on("unmaximize", () => {
        currentState.isMaximized = false;
        scheduleSave();
      });
    },

    flush: () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      saveWindowState(userDataPath, currentState);
    },
  };
}
