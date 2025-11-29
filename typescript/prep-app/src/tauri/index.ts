import { invoke } from '@tauri-apps/api/core';
import { open as shellOpen } from '@tauri-apps/plugin-shell';
import { platform } from '@tauri-apps/plugin-os';
// import { exit } from '@tauri-apps/api/app'; // Not available in Tauri v2
import { getVersion } from '@tauri-apps/api/app';


import { fs } from './fs';
import { storage } from './json-storage';
import { nativeWindow } from './window';

// Console bridge - forward console messages to Rust terminal
const bridgeConsoleToRust = () => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  console.log = (...args: any[]) => {
    originalLog(...args);
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    invoke('console_log', { level: 'log', message }).catch(() => {});
  };

  console.warn = (...args: any[]) => {
    originalWarn(...args);
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    invoke('console_log', { level: 'warn', message }).catch(() => {});
  };

  console.error = (...args: any[]) => {
    originalError(...args);
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    invoke('console_log', { level: 'error', message }).catch(() => {});
  };

  console.info = (...args: any[]) => {
    originalInfo(...args);
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    invoke('console_log', { level: 'info', message }).catch(() => {});
  };
};

// Initialize console bridge in development
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  bridgeConsoleToRust();
  console.log('🔧 Console bridge initialized - messages will appear in terminal');
}

// Dialog operations

export const appQuit = async (): Promise<void> => {
  await nativeWindow.MAIN_WINDOW.close();
};

export const appVersion = async (): Promise<string> => {
  return await getVersion();
};

// Shell operations
export const shellOpenExternal = async (url: string): Promise<void> => {
  await shellOpen(url);
};

export const shellShowItemInFolder = async (fullPath: string): Promise<void> => {
  // Tauri doesn't have a direct equivalent, so we'll open the parent directory
  const path = fullPath.split('/').slice(0, -1).join('/');
  await shellOpen(path);
};

// User settings operations

// Platform information
export const getPlatform = (): string => {
  return platform();
};

// DevTools operations (not available in Tauri)
export const toggleDevTools = async (): Promise<void> => {
  console.log('🔧 DevTools not directly available in Tauri');
  console.log('🔧 For debugging:');
  console.log('🔧 1. Open Chrome and go to chrome://inspect');
  console.log('🔧 2. Look for "Remote Target" with your app');
  console.log('🔧 3. Click "inspect" to open DevTools');
  console.log('🔧 Alternative: Check the terminal for debug output');
};

// Create the electronAPI compatibility layer
export const nativeAPI = {
  toggleDevTools,

  // App operations
  appQuit,
  appVersion,

  // Shell operations
  shellOpenExternal,
  shellShowItemInFolder,

  nativeWindow,
  storage,
  fs,

  // Platform information
  platform: getPlatform,
};
