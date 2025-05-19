
"use client";

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ThemeSettings, ThemeColors } from '@/types';
import { LOCAL_STORAGE_KEYS, DEFAULT_THEME_SETTINGS } from '@/lib/constants';

interface SettingsContextType {
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings | ((val: ThemeSettings) => ThemeSettings)) => void;
  resetThemeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const applyThemeColors = (colors: ThemeColors) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeSettings, setThemeSettings] = useLocalStorage<ThemeSettings>(
    LOCAL_STORAGE_KEYS.THEME_SETTINGS,
    DEFAULT_THEME_SETTINGS
  );

  useEffect(() => {
    applyThemeColors(themeSettings.colors);
  }, [themeSettings.colors]);

  const resetThemeSettings = () => {
    setThemeSettings(DEFAULT_THEME_SETTINGS);
  };

  const contextValue = useMemo(() => ({
    themeSettings,
    setThemeSettings,
    resetThemeSettings,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [themeSettings]); // setThemeSettings is stable from useLocalStorage

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
