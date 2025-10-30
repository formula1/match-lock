#!/usr/bin/env node

import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

import {
  keyToFilename as rawKeyToFilename,
  filenameToKey as rawFilenameToKey,
 } from './filename';

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
    for(const file of await readdir(STORAGE_DIR)){
      if(!isFilenameValid(file)) continue;
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

// CLI interface
async function main() {
  const [,, command, ...args] = process.argv;
  
  try {
    switch (command) {
      case 'get':
        const value = await storageGet(args[0]);
        console.log(JSON.stringify(value));
        break;
      case 'set':
        const success = await storageSet(args[0], JSON.parse(args[1]));
        console.log(JSON.stringify(success));
        break;
      case 'remove':
        const removed = await storageRemove(args[0]);
        console.log(JSON.stringify(removed));
        break;
      case 'keys':
        const keys = await storageKeys();
        console.log(JSON.stringify(keys));
        break;
      case 'clear':
        const cleared = await storageClear();
        console.log(JSON.stringify(cleared));
        break;
      default:
        console.error('Unknown command:', command);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
