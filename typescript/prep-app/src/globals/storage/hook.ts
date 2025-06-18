import { useState, useEffect, useCallback, useMemo } from 'react';

import { TypedStorageService } from './typed';

/**
 * Generic hook for storage operations
 */

export function useStorage<T>(key: string, defaultValue?: T) {
  const storageService = useMemo(() => new TypedStorageService<T>(key), [key]);
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load value on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        setError(null);
        const storedValue = await storageService.get();
        setValue(storedValue ?? defaultValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to load`);
        setValue(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [storageService, defaultValue]);

  const updateValue = useCallback(async (newValue: T) => {
    try {
      setError(null);
      await storageService.set(newValue);
      setValue(newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update`);
    }
  }, [storageService]);

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await storageService.remove();
      setValue(defaultValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to remove`);
    }
  }, [storageService, defaultValue]);

  return {
    value,
    loading,
    error,
    setValue: updateValue,
    removeValue,
  };
}
