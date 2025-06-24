import { app, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export function bindKeyStorageToIpc(){
  const KEY_STORAGE_FOLDER = "key-storage";

  // Handle user data storage operations
  const getUserDataPath = (key: string) => {
    return path.join(app.getPath('userData'), KEY_STORAGE_FOLDER, keyToFilename(key));
  };

  ipcMain.handle('storage-get', async (_event, key: string) => {
    const filePath = getUserDataPath(key);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  });

  ipcMain.handle('storage-set', async (_event, key: string, value: unknown) => {
    const filePath = getUserDataPath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
  });

  ipcMain.handle('storage-remove', async (_event, key: string) => {
    const filePath = getUserDataPath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  ipcMain.handle('storage-keys', async () => {
    const dir = path.join(app.getPath('userData'), KEY_STORAGE_FOLDER);
    if(!fs.existsSync(dir)) return [];
    const keys: Array<string> = [];
    for(const file of fs.readdirSync(dir)){
      if(!isFilenameValid(file)) continue;
      keys.push(filenameToKey(file));
    }
    return keys;
  });

  ipcMain.handle('storage-clear', async () => {
    const dir = path.join(app.getPath('userData'), KEY_STORAGE_FOLDER);
    if(!fs.existsSync(dir)) return;
    for(const file of fs.readdirSync(dir)){
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    };
  });
}

import {
  keyToFilename as rawKeyToFilename,
  filenameToKey as rawFilenameToKey
} from '../../utils/filename';

const PREFIX = "store-";

function keyToFilename(key: string): string {
  return `${PREFIX}${rawKeyToFilename(key)}.json`;
}

function isFilenameValid(filename: string): boolean {
  return filename.startsWith(PREFIX) && filename.endsWith(".json");
}

function filenameToKey(filename: string): string {
  if (!isFilenameValid(filename)) {
    throw new Error("Invalid filename format");
  }

  const name = filename.slice(PREFIX.length, -5); // remove prefix and ".json"
  return rawFilenameToKey(name);
}
