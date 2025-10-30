#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// User settings management using TypeScript
const USER_SETTINGS_DIR = join(homedir(), '.matchlock-prep-app');
const USER_SETTINGS_FILE = join(USER_SETTINGS_DIR, 'user-settings.json');

type UserSettings = {
  matchLockDirChoice: 'create' | 'dontAsk' | 'askLater';
}

const DEFAULT_SETTINGS: UserSettings = {
  matchLockDirChoice: 'askLater'
};

// Ensure settings directory exists
async function ensureSettingsDir() {
  if (!existsSync(USER_SETTINGS_DIR)) {
    await mkdir(USER_SETTINGS_DIR, { recursive: true });
  }
}

async function getUserSettings(): Promise<UserSettings> {
  try {
    await ensureSettingsDir();
    
    if (!existsSync(USER_SETTINGS_FILE)) {
      return DEFAULT_SETTINGS;
    }
    
    const data = await readFile(USER_SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data) as UserSettings;
    return { ...DEFAULT_SETTINGS, ...settings };
  } catch (error) {
    console.error('Error reading user settings:', error);
    return DEFAULT_SETTINGS;
  }
}

async function updateUserSettings(newSettings: Partial<UserSettings>): Promise<boolean> {
  try {
    await ensureSettingsDir();
    
    const currentSettings = await getUserSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    
    await writeFile(USER_SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
}

async function initializeUserDirectories(): Promise<{ shouldShowDialog: boolean; matchLockDir: string }> {
  try {
    const homeDir = homedir();
    const matchLockDir = join(homeDir, 'match-lock');
    
    // Check if the match-lock directory already exists
    if (existsSync(matchLockDir)) {
      return { shouldShowDialog: false, matchLockDir };
    }
    
    const settings = await getUserSettings();
    
    // If user previously chose to create, create it automatically
    if (settings.matchLockDirChoice === 'create') {
      await mkdir(matchLockDir, { recursive: true });
      return { shouldShowDialog: false, matchLockDir };
    }

    // If user chose don't ask, skip
    if (settings.matchLockDirChoice === 'dontAsk') {
      return { shouldShowDialog: false, matchLockDir };
    }
    
    // Otherwise, show dialog
    return { shouldShowDialog: true, matchLockDir };
  } catch (error) {
    console.error('Error initializing user directories:', error);
    return { shouldShowDialog: false, matchLockDir: join(homedir(), 'match-lock') };
  }
}

async function handleUserChoice(choice: 'create' | 'askLater' | 'dontAsk', matchLockDir: string): Promise<boolean> {
  try {
    switch (choice) {
      case 'create':
        await mkdir(matchLockDir, { recursive: true });
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
  } catch (error) {
    // Use stderr for error logging so it doesn't interfere with JSON output
    console.error('Error handling user choice:', error);
    return false;
  }
}

// CLI interface
async function main() {
  const [,, command, ...args] = process.argv;
  
  try {
    switch (command) {
      case 'get':
        const settings = await getUserSettings();
        console.log(JSON.stringify(settings));
        break;
      case 'update':
        const newSettings = JSON.parse(args[0]) as Partial<UserSettings>;
        const success = await updateUserSettings(newSettings);
        console.log(JSON.stringify(success));
        break;
      case 'initialize':
        const result = await initializeUserDirectories();
        console.log(JSON.stringify(result));
        break;
      case 'handleChoice':
        const choice = args[0] as 'create' | 'askLater' | 'dontAsk';
        const matchLockDir = args[1];
        const handled = await handleUserChoice(choice, matchLockDir);
        console.log(JSON.stringify(handled));
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
