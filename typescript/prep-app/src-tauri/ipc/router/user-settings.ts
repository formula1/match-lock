import Router from 'router';
import { IncomingMessage, ServerResponse } from 'http';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { jsonBody, sendJson, sendError } from '../util/http-json';

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
      console.log('✅ Created match-lock directory automatically:', matchLockDir);
      return { shouldShowDialog: false, matchLockDir };
    }

    // If user chose don't ask, skip
    if (settings.matchLockDirChoice === 'dontAsk') {
      console.log('ℹ️ User chose not to be asked again, skipping match-lock directory creation');
      return { shouldShowDialog: false, matchLockDir };
    }

    // Default: ask the user
    return { shouldShowDialog: true, matchLockDir };
  } catch (error) {
    console.error('Error initializing user directories:', error);
    const homeDir = homedir();
    const matchLockDir = join(homeDir, 'match-lock');
    return { shouldShowDialog: true, matchLockDir };
  }
}

async function handleUserChoice(choice: 'create' | 'askLater' | 'dontAsk', matchLockDir: string): Promise<boolean> {
  try {
    switch (choice) {
      case 'create':
        await mkdir(matchLockDir, { recursive: true });
        await updateUserSettings({ matchLockDirChoice: 'create' });
        console.log('✅ Created match-lock directory:', matchLockDir);
        return true;
      case 'askLater':
        return true;
      case 'dontAsk':
        await updateUserSettings({ matchLockDirChoice: 'dontAsk' });
        console.log('ℹ️ User chose not to be asked again');
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error handling user choice:', error);
    return false;
  }
}

// Create and configure the user settings router
export function createUserSettingsRouter(): Router {
  const router = Router();

  // GET /user-settings
  router.get('/', async (req, res) => {
    try {
      const settings = await getUserSettings();
      sendJson(res, settings);
    } catch (error) {
      sendError(res, `Failed to get user settings: ${error}`);
    }
  });

  // POST /user-settings
  router.post('/', async (req, res) => {
    try {
      const body = await jsonBody(req) as Partial<UserSettings>;
      const success = await updateUserSettings(body);
      sendJson(res, { success });
    } catch (error) {
      sendError(res, `Failed to update user settings: ${error}`);
    }
  });

  // POST /user-settings/initialize
  router.post('/initialize', async (req, res) => {
    try {
      const result = await initializeUserDirectories();
      sendJson(res, result);
    } catch (error) {
      sendError(res, `Failed to initialize user directories: ${error}`);
    }
  });

  // POST /user-settings/handle-choice
  router.post('/handle-choice', async (req, res) => {
    try {
      const body = await jsonBody(req) as { choice: 'create' | 'askLater' | 'dontAsk'; matchLockDir: string };
      const success = await handleUserChoice(body.choice, body.matchLockDir);
      sendJson(res, { success });
    } catch (error) {
      sendError(res, `Failed to handle user choice: ${error}`);
    }
  });

  return router;
}
