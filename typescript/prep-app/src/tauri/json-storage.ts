import { invoke } from '@tauri-apps/api/core';

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
