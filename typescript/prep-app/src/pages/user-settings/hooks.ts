import { useState, useEffect } from 'react';

interface UserSettingsState {
  state: "loading" | "expecting-input" | "ready";
  matchLockDir: string;
}

export const useUserSettings = () => {
  const [state, setState] = useState<UserSettingsState>({
    state: "loading",
    matchLockDir: '',
  });

  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        // Initialize user directories and check if dialog should be shown
        const result = await window.electronAPI.initializeUserDirectories();
        
        if (result.shouldShowDialog) {
          setState({
            state: "expecting-input",
            matchLockDir: result.matchLockDir,
          });
        } else {
          setState({
            state: "ready",
            matchLockDir: result.matchLockDir,
          });
        }
      } catch (error) {
        console.error('Failed to initialize user settings:', error);
      }
    });
  }, []);

  const handleUserChoice = async (choice: 'create' | 'askLater' | 'dontAsk') => {
    try {
      await window.electronAPI.handleUserChoice(choice, state.matchLockDir);
      setState(prev => ({ ...prev, isDialogOpen: false }));
    } catch (error) {
      console.error('Failed to handle user choice:', error);
    }
  };

  return {
    state: state.state,
    matchLockDir: state.matchLockDir,
    handleUserChoice,
  };
};
