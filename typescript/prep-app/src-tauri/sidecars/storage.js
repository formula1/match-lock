#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const filename_1 = require("./filename");
const STORAGE_DIR = (0, path_1.join)((0, os_1.homedir)(), '.matchlock-prep-app', 'storage');
async function ensureStorageDir() {
    if (!(0, fs_1.existsSync)(STORAGE_DIR)) {
        await (0, promises_1.mkdir)(STORAGE_DIR, { recursive: true });
    }
}
const PREFIX = "store-";
function keyToFilename(key) {
    return `${PREFIX}${(0, filename_1.keyToFilename)(key)}.json`;
}
function isFilenameValid(filename) {
    return filename.startsWith(PREFIX) && filename.endsWith(".json");
}
function filenameToKey(filename) {
    if (!isFilenameValid(filename)) {
        throw new Error("Invalid filename format");
    }
    const name = filename.slice(PREFIX.length, -5);
    return (0, filename_1.filenameToKey)(name);
}
async function storageGet(key) {
    try {
        await ensureStorageDir();
        const filename = keyToFilename(key);
        const filepath = (0, path_1.join)(STORAGE_DIR, filename);
        if (!(0, fs_1.existsSync)(filepath)) {
            return null;
        }
        const data = await (0, promises_1.readFile)(filepath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Storage get error:', error);
        return null;
    }
}
async function storageSet(key, value) {
    try {
        await ensureStorageDir();
        const filename = keyToFilename(key);
        const filepath = (0, path_1.join)(STORAGE_DIR, filename);
        await (0, promises_1.writeFile)(filepath, JSON.stringify(value, null, 2));
        return true;
    }
    catch (error) {
        console.error('Storage set error:', error);
        return false;
    }
}
async function storageRemove(key) {
    try {
        await ensureStorageDir();
        const filename = keyToFilename(key);
        const filepath = (0, path_1.join)(STORAGE_DIR, filename);
        if ((0, fs_1.existsSync)(filepath)) {
            await (0, promises_1.unlink)(filepath);
        }
        return true;
    }
    catch (error) {
        console.error('Storage remove error:', error);
        return false;
    }
}
async function storageKeys() {
    try {
        await ensureStorageDir();
        const keys = [];
        for (const file of await (0, promises_1.readdir)(STORAGE_DIR)) {
            if (!isFilenameValid(file))
                continue;
            keys.push(filenameToKey(file));
        }
        return keys;
    }
    catch (error) {
        console.error('Storage keys error:', error);
        return [];
    }
}
async function storageClear() {
    try {
        await ensureStorageDir();
        const files = await (0, promises_1.readdir)(STORAGE_DIR);
        for (const file of files) {
            if (!isFilenameValid(file))
                continue;
            await (0, promises_1.unlink)((0, path_1.join)(STORAGE_DIR, file));
        }
        return true;
    }
    catch (error) {
        console.error('Storage clear error:', error);
        return false;
    }
}
async function main() {
    const [, , command, ...args] = process.argv;
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
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
