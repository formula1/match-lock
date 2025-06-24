/**
 * Storage service for managing user preferences and recent files
 * Uses Electron's user data directory for persistent storage
 */

import { TypedStorageService, useStorage } from "../../../globals/storage";

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: string; // ISO date string
  type?: string; // file type or category
}

const RECENT_FILES_KEY = "recent-engine-files";
const RECENT_FILES_STORAGE = new TypedStorageService<RecentFile[]>(RECENT_FILES_KEY);

export const RecentFileStorage = {
/**
   * Get all recent files
   */
  async getRecentFiles(): Promise<RecentFile[]> {
    const files = await RECENT_FILES_STORAGE.get();
    return Array.isArray(files) ? files : [];
  },

  /**
   * Add a file to recent files list
   */
  async addRecentFile(filePath: string, fileName?: string, fileType?: string): Promise<void> {
    const recentFiles = await this.getRecentFiles();
    
    // Extract filename if not provided
    const name = fileName || filePath.split(/[/\\]/).pop() || filePath;
    
    const newFile: RecentFile = {
      path: filePath,
      name,
      lastOpened: new Date().toISOString(),
      type: fileType,
    };

    // Remove existing entry if it exists
    const filteredFiles = recentFiles.filter(file => file.path !== filePath);
    
    await RECENT_FILES_STORAGE.set([newFile, ...filteredFiles]);
  },

  /**
   * Remove a file from recent files list
   */
  async removeRecentFile(filePath: string): Promise<void> {
    const recentFiles = await this.getRecentFiles();
    const filteredFiles = recentFiles.filter(file => file.path !== filePath);
    await RECENT_FILES_STORAGE.set(filteredFiles);
  },

  /**
   * Clear all recent files
   */
  async clearRecentFiles(): Promise<void> {
    await RECENT_FILES_STORAGE.set([]);
  }
}


export function useRecentFiles(){
  const storage = useStorage<RecentFile[]>(RECENT_FILES_KEY);

  return {
    ...storage,
    addRecentFile: async (filePath: string, fileName?: string, fileType?: string) => {
      const recentFiles = storage.value || [];
      
      // Extract filename if not provided
      const name = fileName || filePath.split(/[/\\]/).pop() || filePath;
      
      const newFile: RecentFile = {
        path: filePath,
        name,
        lastOpened: new Date().toISOString(),
        type: fileType,
      };

      // Remove existing entry if it exists
      const filteredFiles = recentFiles.filter(file => file.path !== filePath);
      
      await storage.setValue([newFile, ...filteredFiles]);
    },
    removeRecentFile: async (filePath: string) => {
      const recentFiles = storage.value || [];
      const filteredFiles = recentFiles.filter(file => file.path !== filePath);
      await storage.setValue(filteredFiles);
    },
    clearRecentFiles: async () => {
      await storage.setValue([]);
    },
  }
}
