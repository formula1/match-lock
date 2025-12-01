import Router from 'router';
import { IncomingMessage, ServerResponse } from 'http';
import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { jsonBody, sendJson, sendError } from '../util/http-json';
import { HTTPError } from '../util/errors';

// Import the filename utilities
import {
  keyToFilename as rawKeyToFilename,
  filenameToKey as rawFilenameToKey,
} from '../util/filename';

// Storage operations using TypeScript instead of Rust
const STORAGE_DIR = join(homedir(), '.matchlock-prep-app', 'storage');

// Ensure storage directory exists
async function ensureStorageDir() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

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

// Storage operations
async function storageGet(key: string): Promise<any> {
  try {
    await ensureStorageDir();
    const filename = keyToFilename(key);
    const filepath = join(STORAGE_DIR, filename);
    
    if (!existsSync(filepath)) {
      return null;
    }
    
    const data = await readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
}

async function storageSet(key: string, value: any): Promise<boolean> {
  try {
    await ensureStorageDir();
    const filename = keyToFilename(key);
    const filepath = join(STORAGE_DIR, filename);
    
    await writeFile(filepath, JSON.stringify(value, null, 2));
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

async function storageRemove(key: string): Promise<boolean> {
  try {
    await ensureStorageDir();
    const filename = keyToFilename(key);
    const filepath = join(STORAGE_DIR, filename);
    
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
    return true;
  } catch (error) {
    console.error('Storage remove error:', error);
    return false;
  }
}

async function storageKeys(): Promise<string[]> {
  try {
    await ensureStorageDir();
    const keys: Array<string> = [];
    for (const file of await readdir(STORAGE_DIR)) {
      if (!isFilenameValid(file)) continue;
      keys.push(filenameToKey(file));
    }
    return keys;
  } catch (error) {
    console.error('Storage keys error:', error);
    return [];
  }
}

async function storageClear(): Promise<boolean> {
  try {
    await ensureStorageDir();
    const files = await readdir(STORAGE_DIR);
    
    for (const file of files) {
      if (!isFilenameValid(file)) continue;
      await unlink(join(STORAGE_DIR, file));
    }
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}


// Create and configure the storage router
export function createStorageRouter(): Router {
  const router = Router();

    // GET /storage-keys
  router.get('/keys', async (req, res) => {
    try {
      const keys = await storageKeys();
      sendJson(res, { keys });
    } catch (error) {
      sendError(res, `Failed to get storage keys: ${error}`);
    }
  });

  // POST /storage-clear
  router.post('/clear', async (req, res) => {
    try {
      const success = await storageClear();
      sendJson(res, { success });
    } catch (error) {
      sendError(res, `Failed to clear storage: ${error}`);
    }
  });

  // GET /storage/:key
  router.get('/:key', async (req, res) => {
    try {
      if(!req.params?.key){
        throw new HTTPError(400, "Key is required");
      }
      const { key } = req.params;
      const value = await storageGet(key);
      sendJson(res, { value });
    } catch (error) {
      sendError(res, `Failed to get storage key: ${error}`);
    }
  });

  // POST /storage/:key
  router.post('/:key', async (req, res) => {
    try {
      if(!req.params?.key){
        throw new HTTPError(400, "Key is required");
      }
      const { key } = req.params;
      const body = await jsonBody(req) as { value: any };
      const success = await storageSet(key, body.value);
      sendJson(res, { success });
    } catch (error) {
      sendError(res, `Failed to set storage key: ${error}`);
    }
  });

  // DELETE /storage/:key
  router.delete('/:key', async (req, res) => {
    try {
      if(!req.params?.key){
        throw new HTTPError(400, "Key is required");
      }
      const { key } = req.params;
      const success = await storageRemove(key);
      sendJson(res, { success });
    } catch (error) {
      sendError(res, `Failed to remove storage key: ${error}`);
    }
  });



  return router;
}
