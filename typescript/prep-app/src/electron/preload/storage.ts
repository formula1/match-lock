import { ipcRenderer } from 'electron';

export type TKeyStorage = {
  get: (key: string) => Promise<unknown| null>;
  set: (key: string, value: unknown) => Promise<void>;
  remove: (key: string) => Promise<void>;
  keys: () => Promise<string[]>;
  clear: () => Promise<void>;
}

export const keyStorage: TKeyStorage = {
  get: (key) => ipcRenderer.invoke('storage-get', key),
  set: (key, value) => ipcRenderer.invoke('storage-set', key, value),
  remove: (key) => ipcRenderer.invoke('storage-remove', key),
  keys: () => ipcRenderer.invoke('storage-keys'),
  clear: () => ipcRenderer.invoke('storage-clear'),
}
