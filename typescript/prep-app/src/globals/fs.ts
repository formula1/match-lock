import { nativeAPI } from "../tauri";

export const FS = {
  readFile: (path: string) => nativeAPI.fs.readFile(path),
  writeFile: (path: string, data: Uint8Array) => nativeAPI.fs.writeFile(path, data),
  removeFile: (path: string) => nativeAPI.fs.removeFile(path),
  mkdir: (path: string) => nativeAPI.fs.mkdir(path),
  mkdirAll: (path: string) => nativeAPI.fs.mkdirAll(path),
  exists: (path: string) => nativeAPI.fs.exists(path),

  getAppDataDir: () => nativeAPI.fs.getAppDataDir(),
  getDocumentsDir: () => nativeAPI.fs.getAppDataDir(),
  getDownloadsDir: () => nativeAPI.fs.getAppDataDir(),
  getMatchLockDir: () => nativeAPI.fs.getAppDataDir(),

  // Directory operations
  readDir: (path: string) => nativeAPI.fs.readDir(path),
  stat: (path: string) => nativeAPI.fs.stat(path),
  walkDir: (path: string) => nativeAPI.fs.walkDir(path),
  startWalkStream: (path: string, callbacks: Parameters<typeof nativeAPI.fs.startWalkStream>[1]) =>
    nativeAPI.fs.startWalkStream(path, callbacks),
}
