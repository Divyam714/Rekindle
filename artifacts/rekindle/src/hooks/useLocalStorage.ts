import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (val: T) => {
      try {
        setStored(val);
        localStorage.setItem(key, JSON.stringify(val));
      } catch {
      }
    },
    [key],
  );

  return [stored, setValue];
}
