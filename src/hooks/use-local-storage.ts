
"use client";

import { useState, useEffect } from 'react';

function getValueFromLocalStorage<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This initializer function runs once when the component mounts.
    return getValueFromLocalStorage(key, initialValue);
  });

  // The useEffect that was previously here to re-sync with initialValue or localStorage
  // has been removed. It was a likely source of infinite loops because JSON.parse
  // creates new object/array references, causing setStoredValue to trigger re-renders.
  // The useState initializer above is now the sole mechanism for initial hydration from localStorage.
  // This hook will no longer automatically react to changes in the `initialValue` prop after mount,
  // nor to external localStorage changes (e.g., from other tabs), but it's safer against this type of loop.

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
