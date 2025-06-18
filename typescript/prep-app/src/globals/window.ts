


export const WINDOW = {
  minimize: () => window.electronAPI.windowMinimize(),
  maximize: () => window.electronAPI.windowMaximize(),
  close: () => window.electronAPI.windowClose(),
  toggleDevTools: () => window.electronAPI.toggleDevTools(),
  showOpenDialog: (...args: Parameters<typeof window.electronAPI.showOpenDialog>)=>(
    window.electronAPI.showOpenDialog(...args)
  ),
  showSaveDialog: (...args: Parameters<typeof window.electronAPI.showSaveDialog>)=>(
    window.electronAPI.showOpenDialog(...args)
  ),
}
