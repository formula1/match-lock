import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import * as path from 'path';
import { bindKeyStorageToIpc } from './storage';
import { bindFsToIpc } from './fs';
import { initializeUserMatchLockDirectories } from './user-settings';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (require('electron-squirrel-startup')) {
  app.quit();
}

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

const createWindow = (): BrowserWindow => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    title: 'MatchLock Prep App',
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation
      preload: path.join(__dirname, 'preload.cjs'), // Load preload script
    },
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
};

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  const mainWindow = createWindow();

  // Initialize user directories after window is created
  await initializeUserMatchLockDirectories(mainWindow);

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// IPC Handlers for renderer process communication

// Handle file dialog requests
ipcMain.handle('show-open-dialog', async (_event, options) => {
  if (!mainWindow) return { canceled: true, filePaths: [] };

  const result = await dialog.showOpenDialog(mainWindow, {
    title: options.title || 'Select Directory',
    defaultPath: options.defaultPath,
    properties: options.properties || ['openDirectory'],
    filters: options.filters,
  });

  return result;
});

ipcMain.handle('show-save-dialog', async (_event, options) => {
  if (!mainWindow) return { canceled: true, filePath: '' };

  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Save File',
    defaultPath: options.defaultPath,
    filters: options.filters,
  });

  return result;
});

// Handle DevTools toggle
ipcMain.handle('toggle-devtools', async () => {
  if (!mainWindow) return;
  
  if (mainWindow.webContents.isDevToolsOpened()) {
    mainWindow.webContents.closeDevTools();
  } else {
    mainWindow.webContents.openDevTools();
  }
});

// Handle window operations
ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window-close', () => {
  mainWindow?.close();
});

// Handle app operations
ipcMain.handle('app-quit', () => {
  app.quit();
});

ipcMain.handle('app-version', () => {
  return app.getVersion();
});

// Handle shell operations
ipcMain.handle('shell-open-external', async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('shell-show-item-in-folder', async (_event, fullPath: string) => {
  shell.showItemInFolder(fullPath);
});

bindKeyStorageToIpc();
bindFsToIpc();

// Development hot reload
if (isDev) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch {
    console.log('electron-reload not available, skipping hot reload');
  }
}
