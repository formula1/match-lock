import { useState, useEffect, useCallback } from 'react';

import { initializeUserDirectories, handleUserChoice as handleUserChoiceAPI } from "./api";

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
        const result = await initializeUserDirectories();
        console.log("Initializing User Settings:", result);
        
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

  const handleUserChoice = useCallback(async (choice: 'create' | 'askLater' | 'dontAsk') => {
    try {
      console.log("Handling User Choice:", choice);
      await handleUserChoiceAPI(choice, state.matchLockDir);
      setState(prev => ({ ...prev, state: "ready" }));
    } catch (error) {
      console.error('Failed to handle user choice:', error);
    }
  }, []);

  return {
    state: state.state,
    matchLockDir: state.matchLockDir,
    handleUserChoice,
  };
};
