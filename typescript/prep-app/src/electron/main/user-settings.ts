import { app, dialog } from 'electron';
import { existsSync as fsExistsSync, } from 'fs';
import {
  readFile as fsReadFile,
  mkdir as fsMkdir,
  writeFile as fsWriteFile
} from 'fs/promises';

import { homedir as osHomedir } from 'os';
import { join as pathJoin } from 'path';

// Initialize user directories on app startup
const USER_SETTINGS_FILE = 'user-settings.json';
type UserSettings = {
  matchLockDirChoice: 'create' | 'dontAsk';
}
const ASK_OPTIONS: Record<string, UserSettings['matchLockDirChoice']> = {
  CREATE: 'create',
  DONT_ASK: 'dontAsk',
}
export async function initializeUserMatchLockDirectories(mainWindow: Electron.BrowserWindow) {
  try {
    const homeDir = osHomedir();
    const matchLockDir = pathJoin(homeDir, 'match-lock');

    // Check if the match-lock directory exists
    if (fsExistsSync(matchLockDir)) return;

    const userSettings = await getUserSetting();
    
    if(userSettings){
      if(userSettings.matchLockDirChoice === ASK_OPTIONS.CREATE){
        await fsMkdir(userSettings.matchLockDir, { recursive: true });
        console.log('✅ Created match-lock directory with user permission:', userSettings.matchLockDir);
        return;
      }
      if(userSettings.matchLockDirChoice === ASK_OPTIONS.DONT_ASK){
        console.log('ℹ️ User chose not to be asked again, skipping match-lock directory creation');
        return;
      }
    }
    
    // Show dialog asking user permission
    if (!mainWindow) {
      console.log('⚠️ No main window available for dialog, creating directory without permission');
      await fs.promises.mkdir(matchLockDir, { recursive: true });
      return;
    }

    const result = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      title: 'First Time Setup',
      message: 'Welcome to MatchLock Prep App!',
      detail: `This app would like to create a folder at:\n${matchLockDir}\n\nThis folder will be used to store your MatchLock configurations and data. You can change this location later in settings.`,
      buttons: ['Create Folder', 'Ask Me Later', 'Don\'t Ask Again'],
      defaultId: 0,
      cancelId: 1,
    });

    switch (result.response) {
      case 0: // Create Folder
        await fsMkdir(matchLockDir, { recursive: true });
        updateUserSettings({ matchLockDirChoice: ASK_OPTIONS.CREATE });
        console.log('✅ Created match-lock directory with user permission:', matchLockDir);
        break;
      case 1: // Ask Me Later
        console.log('ℹ️ User chose to be asked later, skipping match-lock directory creation');
        break;
      case 2: // Don't Ask Again
        updateUserSettings({ matchLockDirChoice: ASK_OPTIONS.DONT_ASK });
        console.log('ℹ️ User chose not to be asked again, skipping match-lock directory creation');
        break;
    }
    if (result.response === 0) {
      await fsMkdir(matchLockDir, { recursive: true });
      console.log('✅ Created match-lock directory with user permission:', matchLockDir);
    } else {
      console.log('ℹ️ User declined to create match-lock directory');
    }
  } catch (error) {
    console.error('❌ Failed to initialize user directories:', error);
  }
}

async function getUserSetting(): Promise<null | UserSettings>{
  const userSettingsPath = pathJoin(app.getPath('userData'), USER_SETTINGS_FILE);
  if(!fsExistsSync(userSettingsPath)) return null;
  const userSettings: UserSettings = JSON.parse(await fsReadFile(userSettingsPath, 'utf8'));
  return userSettings;
}

let currentAccess = Promise.resolve();
async function updateUserSettings(newValues: Partial<UserSettings>){
  const previousAccess = currentAccess;
  const toRun = Promise.resolve().then(async ()=>{
    await previousAccess;
    const userSettingsPath = pathJoin(app.getPath('userData'), USER_SETTINGS_FILE);
    const userSettings = JSON.parse(await fsReadFile(userSettingsPath, 'utf8')) as UserSettings;
    const updatedSettings = { ...userSettings, ...newValues };
    await fsWriteFile(userSettingsPath, JSON.stringify(updatedSettings, null, 2));
  })
  currentAccess = toRun.finally(()=>(void 0));
  return toRun;
}
