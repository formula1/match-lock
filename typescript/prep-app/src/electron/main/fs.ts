import { ipcMain, app } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function bindFsToIpc(){
  ipcMain.handle('fs-read-file', async (_event, path: string) => {
    const data = await fs.promises.readFile(path);
    return new Uint8Array(data);
  });

  ipcMain.handle('fs-write-file', async (_event, path: string, data: Uint8Array) => {
    await fs.promises.writeFile(path, Buffer.from(data));
  });

  ipcMain.handle('fs-remove-file', async (_event, path: string) => {
    await fs.promises.unlink(path);
  });

  ipcMain.handle('fs-mkdir', async (_event, path: string) => {
    await fs.promises.mkdir(path);
  });

  ipcMain.handle('fs-mkdir-all', async (_event, path: string) => {
    await fs.promises.mkdir(path, { recursive: true });
  });

  ipcMain.handle('fs-exists', async (_event, path: string) => {
    return fs.existsSync(path);
  });

  // Path utilities
  ipcMain.handle('fs-get-home-dir', async () => {
    return os.homedir();
  });

  ipcMain.handle('fs-get-app-data-dir', async () => {
    return app.getPath('userData');
  });

  ipcMain.handle('fs-get-documents-dir', async () => {
    return app.getPath('documents');
  });

  ipcMain.handle('fs-get-downloads-dir', async () => {
    return app.getPath('downloads');
  });

  // Get user's match-lock directory path
  ipcMain.handle('fs-get-match-lock-dir', async () => {
    const homeDir = os.homedir();
    return path.join(homeDir, 'match-lock');
  });

  // Directory reading operations
  ipcMain.handle('fs-read-dir', async (_event, dirPath: string) => {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile(),
    }));
  });

  ipcMain.handle('fs-stat', async (_event, filePath: string) => {
    const stats = await fs.promises.stat(filePath);
    return {
      size: stats.size,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      mtime: stats.mtime.toISOString(),
      ctime: stats.ctime.toISOString(),
    };
  });

  // Start streaming file walk operation
  ipcMain.handle('fs-start-walk-stream', async (event, dirPath: string, streamId: string) => {
    async function walkRecursive(currentPath: string, basePath: string) {
      try {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relativePath = path.relative(basePath, fullPath);

          if (entry.isFile()) {
            const stats = await fs.promises.stat(fullPath);
            // Send each file result immediately
            event.sender.send('fs-walk-stream-data', streamId, {
              path: fullPath,
              relativePath,
              isDirectory: false,
              isFile: true,
              size: stats.size,
            });
          } else if (entry.isDirectory()) {
            // Recursively walk subdirectories
            await walkRecursive(fullPath, basePath);
          }
        }
      } catch (error) {
        console.error(`Error walking directory ${currentPath}:`, error);
        event.sender.send('fs-walk-stream-error', streamId, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    try {
      await walkRecursive(dirPath, dirPath);
      // Signal completion
      event.sender.send('fs-walk-stream-end', streamId);
    } catch (error) {
      event.sender.send('fs-walk-stream-error', streamId, error instanceof Error ? error.message : 'Unknown error');
    }
  });
}

