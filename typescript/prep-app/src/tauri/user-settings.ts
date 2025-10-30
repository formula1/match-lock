import { invoke } from '@tauri-apps/api/core';


export const userSettings = {
  handleUserChoice: async (choice: string, matchLockDir: string) => {
    return await invoke(
      'handle_user_choice', { choice, matchLockDir }
    ) as boolean;
  },
  initializeUserDirectories: async () => {
    return await invoke(
      'initialize_user_directories'
    ) as { shouldShowDialog: boolean, matchLockDir: string };
  },
};
