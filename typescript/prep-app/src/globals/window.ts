
import { nativeAPI } from "../tauri";


export const WINDOW = {
  minimize: () => nativeAPI.nativeWindow.minimize(),
  maximize: () => nativeAPI.nativeWindow.maximize(),
  close: () => nativeAPI.nativeWindow.close(),
  toggleDevTools: () => nativeAPI.toggleDevTools(),
  showOpenDialog: (...args: Parameters<typeof nativeAPI.nativeWindow.showOpenDialog>)=>(
    nativeAPI.nativeWindow.showOpenDialog(...args)
  ),
  showSaveDialog: (...args: Parameters<typeof nativeAPI.nativeWindow.showSaveDialog>)=>(
    nativeAPI.nativeWindow.showOpenDialog(...args)
  ),
}
