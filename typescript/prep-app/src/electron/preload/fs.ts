import { ipcRenderer, type IpcRendererEvent } from 'electron';

export type DirEntry = {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
};

export type FileStat = {
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  mtime: string;
  ctime: string;
};

export type WalkResult = {
  path: string;
  relativePath: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
};

export type WalkStreamCallbacks = {
  onData: (result: WalkResult) => void;
  onError: (error: string) => void;
  onEnd: () => void;
};

export type FS = {
  readFile: (path: string) => Promise<Uint8Array>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  removeFile: (path: string) => Promise<void>;
  mkdir: (path: string) => Promise<void>;
  mkdirAll: (path: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  getHomeDir: () => Promise<string>;

  getAppDataDir: () => Promise<string>;
  getDocumentsDir: () => Promise<string>;
  getDownloadsDir: () => Promise<string>;
  getMatchLockDir: () => Promise<string>;

  // Directory operations
  readDir: (path: string) => Promise<DirEntry[]>;
  stat: (path: string) => Promise<FileStat>;
  walkDir: (path: string) => Promise<WalkResult[]>;

  // Streaming directory walk
  startWalkStream: (path: string, callbacks: WalkStreamCallbacks) => Promise<void>;
}

export const fs: FS = {
  readFile: (path) => ipcRenderer.invoke('fs-read-file', path),
  writeFile: (path, data) => ipcRenderer.invoke('fs-write-file', path, data),
  removeFile: (path) => ipcRenderer.invoke('fs-remove-file', path),
  mkdir: (path) => ipcRenderer.invoke('fs-mkdir', path),
  mkdirAll: (path) => ipcRenderer.invoke('fs-mkdir-all', path),
  exists: (path) => ipcRenderer.invoke('fs-exists', path),
  getHomeDir: () => ipcRenderer.invoke('fs-get-home-dir'),

  getAppDataDir: () => ipcRenderer.invoke('fs-get-app-data-dir'),
  getDocumentsDir: () => ipcRenderer.invoke('fs-get-documents-dir'),
  getDownloadsDir: () => ipcRenderer.invoke('fs-get-downloads-dir'),
  getMatchLockDir: () => ipcRenderer.invoke('fs-get-match-lock-dir'),

  // Directory operations
  readDir: (path) => ipcRenderer.invoke('fs-read-dir', path),
  stat: (path) => ipcRenderer.invoke('fs-stat', path),
  walkDir: (path) => ipcRenderer.invoke('fs-walk-dir', path),

  // Streaming directory walk
  startWalkStream: (path, callbacks) => {
    return new Promise<void>((resolve, reject) => {
      const streamId = `walk-${Date.now()}-${Math.random()}`;

      const dataHandler = (_event: IpcRendererEvent, id: string, result: WalkResult) => {
        if (id === streamId) {
          callbacks.onData(result);
        }
      };

      const errorHandler = (_event: IpcRendererEvent, id: string, error: string) => {
        if (id === streamId) {
          cleanup();
          callbacks.onError(error);
          reject(new Error(error));
        }
      };

      const endHandler = (_event: IpcRendererEvent, id: string) => {
        if (id === streamId) {
          cleanup();
          callbacks.onEnd();
          resolve();
        }
      };

      const cleanup = () => {
        ipcRenderer.removeListener('fs-walk-stream-data', dataHandler);
        ipcRenderer.removeListener('fs-walk-stream-error', errorHandler);
        ipcRenderer.removeListener('fs-walk-stream-end', endHandler);
      };

      // Set up event listeners
      ipcRenderer.on('fs-walk-stream-data', dataHandler);
      ipcRenderer.on('fs-walk-stream-error', errorHandler);
      ipcRenderer.on('fs-walk-stream-end', endHandler);

      // Start the stream
      ipcRenderer.invoke('fs-start-walk-stream', path, streamId).catch(reject);
    });
  },
}
