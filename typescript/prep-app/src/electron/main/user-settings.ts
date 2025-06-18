import { app, dialog } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Initialize user directories on app startup
const USER_SETTINGS_KEY = 'user-settings.json';
export async function initializeUserMatchLockDirectories(mainWindow: Electron.BrowserWindow) {
  try {
    const homeDir = os.homedir();
    const matchLockDir = path.join(homeDir, 'match-lock');

    // Check if the match-lock directory exists
    if (fs.existsSync(matchLockDir)) return;

    const userSettingsPath = path.join(app.getPath('userData'), USER_SETTINGS_KEY);
    
    if(fs.existsSync(userSettingsPath)){
      const userSettings = JSON.parse(await fs.promises.readFile(userSettingsPath, 'utf8'));
      if(userSettings.matchLockDir === "create"){
        await fs.promises.mkdir(userSettings.matchLockDir, { recursive: true });
        console.log('✅ Created match-lock directory with user permission:', userSettings.matchLockDir);
        return;
      }
      if(userSettings.matchLockDir === "dontAsk"){
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
        await fs.promises.mkdir(matchLockDir, { recursive: true });
        updateUserSettings({ matchLockDirChoice: 'create' });
        console.log('✅ Created match-lock directory with user permission:', matchLockDir);
        break;
      case 1: // Ask Me Later
        console.log('ℹ️ User chose to be asked later, skipping match-lock directory creation');
        break;
      case 2: // Don't Ask Again
        updateUserSettings({ matchLockDirChoice: 'dontAsk' });
        console.log('ℹ️ User chose not to be asked again, skipping match-lock directory creation');
        break;
    }
    if (result.response === 0) {
      await fs.promises.mkdir(matchLockDir, { recursive: true });
      console.log('✅ Created match-lock directory with user permission:', matchLockDir);
    } else {
      console.log('ℹ️ User declined to create match-lock directory');
    }
  } catch (error) {
    console.error('❌ Failed to initialize user directories:', error);
  }
}
type UserSettings = {
  matchLockDirChoice: 'create' | 'dontAsk';
}

function updateUserSettings(newValues: Partial<UserSettings>){
  const userSettingsPath = path.join(app.getPath('userData'), USER_SETTINGS_KEY);
  const userSettings = JSON.parse(fs.readFileSync(userSettingsPath, 'utf8')) as UserSettings;
  const updatedSettings = { ...userSettings, ...newValues };
  fs.writeFileSync(userSettingsPath, JSON.stringify(updatedSettings, null, 2));
}