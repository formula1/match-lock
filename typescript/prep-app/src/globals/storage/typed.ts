
export class TypedStorageService<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Generic storage methods for other data
   */
  async get(): Promise<T | null> {
    return await window.electronAPI.storage.get(this.key) as T | null;
  }

  async set(value: T): Promise<void> {
    await window.electronAPI.storage.set(this.key, value);
  }

  async remove(): Promise<void> {
    await window.electronAPI.storage.remove(this.key);
  }

  async exists(): Promise<boolean> {
    const value = await window.electronAPI.storage.get(this.key);
    return value !== null;
  }

  async keys(): Promise<string[]> {
    return window.electronAPI.storage.keys();
  }

  async clear(): Promise<void> {
    await window.electronAPI.storage.clear();
  }
}
