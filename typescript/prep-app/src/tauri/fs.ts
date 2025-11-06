import { invoke } from '@tauri-apps/api/core';
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
  homeDir: async (): Promise<string> => {
    return await invoke('fs_home_dir');
  },

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
