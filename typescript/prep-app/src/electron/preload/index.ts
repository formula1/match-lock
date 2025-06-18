import { contextBridge, ipcRenderer } from 'electron';

import { keyStorage, type TKeyStorage } from "./storage"
import { fs, type FS } from "./fs"

// Define the API interface that will be exposed to the renderer process
interface ElectronAPI {
  // File dialog operations
  showOpenDialog: (options?: {
    title?: string;
    defaultPath?: string;
    properties?: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory')[];
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;

  showSaveDialog: (options?: {
    title?: string;
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ canceled: boolean; filePath?: string }>;

  // DevTools operations
  toggleDevTools: () => Promise<void>;

  // Window operations
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;

  // App operations
  appQuit: () => Promise<void>;
  appVersion: () => Promise<string>;

  // Shell operations
  shellOpenExternal: (url: string) => Promise<void>;
  shellShowItemInFolder: (fullPath: string) => Promise<void>;

  // Storage operations
  storage: TKeyStorage

  // Filesystem operations
  fs: FS

  // Platform information
  platform: NodeJS.Platform;
}

// Extend the global Window interface to include our Electron APIs
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
    };
  }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // File dialog operations
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // DevTools operations
  toggleDevTools: () => ipcRenderer.invoke('toggle-devtools'),

  // Window operations
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // App operations
  appQuit: () => ipcRenderer.invoke('app-quit'),
  appVersion: () => ipcRenderer.invoke('app-version'),

  // Shell operations
  shellOpenExternal: (url) => ipcRenderer.invoke('shell-open-external', url),
  shellShowItemInFolder: (fullPath) => ipcRenderer.invoke('shell-show-item-in-folder', fullPath),

  // Storage operations
  storage: keyStorage,

  // Filesystem operations
  fs: fs,

  // Platform information
  platform: process.platform,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error('Failed to expose electronAPI:', error);
  }
} else {
  // Fallback for when context isolation is disabled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).electronAPI = electronAPI;
}

// Expose a version check function
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

// Log that preload script has loaded
console.log('✅ Electron preload script loaded successfully');
