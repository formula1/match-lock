#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const USER_SETTINGS_DIR = (0, path_1.join)((0, os_1.homedir)(), '.matchlock-prep-app');
const USER_SETTINGS_FILE = (0, path_1.join)(USER_SETTINGS_DIR, 'user-settings.json');
const DEFAULT_SETTINGS = {
    matchLockDirChoice: 'askLater'
};
async function ensureSettingsDir() {
    if (!(0, fs_1.existsSync)(USER_SETTINGS_DIR)) {
        await (0, promises_1.mkdir)(USER_SETTINGS_DIR, { recursive: true });
    }
}
async function getUserSettings() {
    try {
        await ensureSettingsDir();
        if (!(0, fs_1.existsSync)(USER_SETTINGS_FILE)) {
            return DEFAULT_SETTINGS;
        }
        const data = await (0, promises_1.readFile)(USER_SETTINGS_FILE, 'utf8');
        const settings = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...settings };
    }
    catch (error) {
        console.error('Error reading user settings:', error);
        return DEFAULT_SETTINGS;
    }
}
async function updateUserSettings(newSettings) {
    try {
        await ensureSettingsDir();
        const currentSettings = await getUserSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        await (0, promises_1.writeFile)(USER_SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
        return true;
    }
    catch (error) {
        console.error('Error updating user settings:', error);
        return false;
    }
}
async function initializeUserDirectories() {
    try {
        const homeDir = (0, os_1.homedir)();
        const matchLockDir = (0, path_1.join)(homeDir, 'match-lock');
        if ((0, fs_1.existsSync)(matchLockDir)) {
            return { shouldShowDialog: false, matchLockDir };
        }
        const settings = await getUserSettings();
        if (settings.matchLockDirChoice === 'create') {
            await (0, promises_1.mkdir)(matchLockDir, { recursive: true });
            return { shouldShowDialog: false, matchLockDir };
        }
        if (settings.matchLockDirChoice === 'dontAsk') {
            return { shouldShowDialog: false, matchLockDir };
        }
        return { shouldShowDialog: true, matchLockDir };
    }
    catch (error) {
        console.error('Error initializing user directories:', error);
        return { shouldShowDialog: false, matchLockDir: (0, path_1.join)((0, os_1.homedir)(), 'match-lock') };
    }
}
async function handleUserChoice(choice, matchLockDir) {
    try {
        switch (choice) {
            case 'create':
                await (0, promises_1.mkdir)(matchLockDir, { recursive: true });
                await updateUserSettings({ matchLockDirChoice: 'create' });
                return true;
            case 'askLater':
                return true;
            case 'dontAsk':
                await updateUserSettings({ matchLockDirChoice: 'dontAsk' });
                return true;
            default:
                return false;
        }
    }
    catch (error) {
        console.error('Error handling user choice:', error);
        return false;
    }
}
async function main() {
    const [, , command, ...args] = process.argv;
    try {
        switch (command) {
            case 'get':
                const settings = await getUserSettings();
                console.log(JSON.stringify(settings));
                break;
            case 'update':
                const newSettings = JSON.parse(args[0]);
                const success = await updateUserSettings(newSettings);
                console.log(JSON.stringify(success));
                break;
            case 'initialize':
                const result = await initializeUserDirectories();
                console.log(JSON.stringify(result));
                break;
            case 'handleChoice':
                const choice = args[0];
                const matchLockDir = args[1];
                const handled = await handleUserChoice(choice, matchLockDir);
                console.log(JSON.stringify(handled));
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
