import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { platform } from '@tauri-apps/plugin-os';
import { getCurrentWindow } from '@tauri-apps/api/window';
// import { exit } from '@tauri-apps/api/app'; // Not available in Tauri v2
import { getVersion } from '@tauri-apps/api/app';
import { listen } from '@tauri-apps/api/event';


// Types matching the Electron API
export interface DirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

export interface FileStat {
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  mtime: string;
  ctime: string;
}

export interface WalkResult {
  path: string;
  relativePath: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
}

export interface WalkStreamCallbacks {
  onData: (result: WalkResult) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

// File system operations
export const fs = {
  readFile: async (path: string): Promise<Uint8Array> => {
    const data: number[] = await invoke('fs_read_file', { path });
    return new Uint8Array(data);
  },

  writeFile: async (path: string, data: Uint8Array): Promise<void> => {
    await invoke('fs_write_file', { path, data: Array.from(data) });
  },

  removeFile: async (path: string): Promise<void> => {
    await invoke('fs_remove_file', { path });
  },

  mkdir: async (path: string): Promise<void> => {
    await invoke('fs_mkdir', { path });
  },

  mkdirAll: async (path: string): Promise<void> => {
    await invoke('fs_mkdir_all', { path });
  },

  exists: async (path: string): Promise<boolean> => {
    return await invoke('fs_exists', { path });
  },

  getHomeDir: async (): Promise<string> => {
    return await invoke('fs_get_home_dir');
  },

  getAppDataDir: async (): Promise<string> => {
    return await invoke('fs_get_app_data_dir');
  },

  getDocumentsDir: async (): Promise<string> => {
    return await invoke('fs_get_documents_dir');
  },

  getDownloadsDir: async (): Promise<string> => {
    return await invoke('fs_get_downloads_dir');
  },

  getMatchLockDir: async (): Promise<string> => {
    return await invoke('fs_get_match_lock_dir');
  },

  readDir: async (path: string): Promise<DirEntry[]> => {
    return await invoke('fs_read_dir', { dirPath: path });
  },

  stat: async (path: string): Promise<FileStat> => {
    return await invoke('fs_stat', { filePath: path });
  },

  walkDir: async (path: string): Promise<WalkResult[]> => {
    // For compatibility, we'll collect all results from the stream
    return new Promise((resolve, reject) => {
      const results: WalkResult[] = [];
      fs.startWalkStream(path, {
        onData: (result) => results.push(result),
        onError: (error) => reject(new Error(error)),
        onEnd: () => resolve(results),
      });
    });
  },

  startWalkStream: async (path: string, callbacks: WalkStreamCallbacks): Promise<void> => {
    const streamId = `walk-${Date.now()}-${Math.random()}`;
    
    // Set up event listeners
    const unlistenData = await listen(`fs-walk-stream-data-${streamId}`, (event) => {
      callbacks.onData(event.payload as WalkResult);
    });

    const unlistenError = await listen(`fs-walk-stream-error-${streamId}`, (event) => {
      callbacks.onError(event.payload as string);
      unlistenData();
      unlistenError();
      unlistenEnd();
    });

    const unlistenEnd = await listen(`fs-walk-stream-end-${streamId}`, () => {
      callbacks.onEnd();
      unlistenData();
      unlistenError();
      unlistenEnd();
    });

    // Start the stream
    await invoke('fs_start_walk_stream', { dirPath: path, streamId });
  },
};

// Storage operations
export const storage = {
  get: async (key: string): Promise<any> => {
    return await invoke('storage_get', { key });
  },

  set: async (key: string, value: any): Promise<void> => {
    await invoke('storage_set', { key, value });
  },

  remove: async (key: string): Promise<void> => {
    await invoke('storage_remove', { key });
  },

  keys: async (): Promise<string[]> => {
    return await invoke('storage_keys');
  },

  clear: async (): Promise<void> => {
    await invoke('storage_clear');
  },
};

// Dialog operations
export const showOpenDialog = async (options?: {
  title?: string;
  defaultPath?: string;
  properties?: ('openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory')[];
  filters?: { name: string; extensions: string[] }[];
}): Promise<{ canceled: boolean; filePaths: string[] }> => {
  try {
    const result = await open({
      title: options?.title,
      defaultPath: options?.defaultPath,
      multiple: options?.properties?.includes('multiSelections'),
      directory: options?.properties?.includes('openDirectory'),
      filters: options?.filters,
    });

    if (result === null) {
      return { canceled: true, filePaths: [] };
    }

    const filePaths = Array.isArray(result) ? result : [result];
    return { canceled: false, filePaths };
  } catch (error) {
    console.error('Dialog error:', error);
    return { canceled: true, filePaths: [] };
  }
};

export const showSaveDialog = async (options?: {
  title?: string;
  defaultPath?: string;
  filters?: { name: string; extensions: string[] }[];
}): Promise<{ canceled: boolean; filePath?: string }> => {
  try {
    const result = await save({
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
    });

    if (result === null) {
      return { canceled: true };
    }

    return { canceled: false, filePath: result };
  } catch (error) {
    console.error('Dialog error:', error);
    return { canceled: true };
  }
};

// Window operations
const currentWindow = getCurrentWindow();

export const windowMinimize = async (): Promise<void> => {
  await currentWindow.minimize();
};

export const windowMaximize = async (): Promise<void> => {
  const isMaximized = await currentWindow.isMaximized();
  if (isMaximized) {
    await currentWindow.unmaximize();
  } else {
    await currentWindow.maximize();
  }
};

export const windowClose = async (): Promise<void> => {
  await currentWindow.close();
};

// App operations
export const appQuit = async (): Promise<void> => {
  await currentWindow.close();
};

export const appVersion = async (): Promise<string> => {
  return await getVersion();
};

// Shell operations
export const shellOpenExternal = async (url: string): Promise<void> => {
  await shellOpen(url);
};

export const shellShowItemInFolder = async (fullPath: string): Promise<void> => {
  // Tauri doesn't have a direct equivalent, so we'll open the parent directory
  const path = fullPath.split('/').slice(0, -1).join('/');
  await shellOpen(path);
};

// User settings operations
export const initializeUserDirectories = async (): Promise<{ shouldShowDialog: boolean; matchLockDir: string }> => {
  return await invoke('initialize_user_directories');
};

export const handleUserChoice = async (choice: string, matchLockDir: string): Promise<boolean> => {
  return await invoke('handle_user_choice', { choice, matchLockDir });
};

// Platform information
export const getPlatform = (): string => {
  return platform();
};

// DevTools operations (not available in Tauri)
export const toggleDevTools = async (): Promise<void> => {
  console.log('DevTools toggle not available in Tauri');
};

// Create the electronAPI compatibility layer
export const electronAPI = {
  // File dialog operations
  showOpenDialog,
  showSaveDialog,

  // DevTools operations
  toggleDevTools,

  // Window operations
  windowMinimize,
  windowMaximize,
  windowClose,

  // App operations
  appQuit,
  appVersion,

  // Shell operations
  shellOpenExternal,
  shellShowItemInFolder,

  // User settings operations
  initializeUserDirectories,
  handleUserChoice,

  // Storage operations
  storage,

  // Filesystem operations
  fs,

  // Platform information
  platform: getPlatform,
};

// Make it available globally for compatibility
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
    };
  }
}

// Set up the global API
if (typeof window !== 'undefined') {
  window.electronAPI = electronAPI;
  window.versions = {
    node: () => 'N/A (Tauri)',
    chrome: () => 'N/A (Tauri)',
    electron: () => 'N/A (Tauri)',
  };
}
