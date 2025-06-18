

export const FS = {
  readFile: (path: string) => window.electronAPI.fs.readFile(path),
  writeFile: (path: string, data: Uint8Array) => window.electronAPI.fs.writeFile(path, data),
  removeFile: (path: string) => window.electronAPI.fs.removeFile(path),
  mkdir: (path: string) => window.electronAPI.fs.mkdir(path),
  mkdirAll: (path: string) => window.electronAPI.fs.mkdirAll(path),
  exists: (path: string) => window.electronAPI.fs.exists(path),

  getAppDataDir: () => window.electronAPI.fs.getAppDataDir(),
  getDocumentsDir: () => window.electronAPI.fs.getAppDataDir(),
  getDownloadsDir: () => window.electronAPI.fs.getAppDataDir(),
  getMatchLockDir: () => window.electronAPI.fs.getAppDataDir(),

  // Directory operations
  readDir: (path: string) => window.electronAPI.fs.readDir(path),
  stat: (path: string) => window.electronAPI.fs.stat(path),
  walkDir: (path: string) => window.electronAPI.fs.walkDir(path),
  startWalkStream: (path: string, callbacks: Parameters<typeof window.electronAPI.fs.startWalkStream>[1]) =>
    window.electronAPI.fs.startWalkStream(path, callbacks),
}
