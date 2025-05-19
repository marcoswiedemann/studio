
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

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  hex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (hex.length !== 6 && hex.length !== 3) return null;
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const rNum = parseInt(hex.substring(0, 2), 16);
  const gNum = parseInt(hex.substring(2, 4), 16);
  const bNum = parseInt(hex.substring(4, 6), 16);

  if (isNaN(rNum) || isNaN(gNum) || isNaN(bNum)) return null;

  const r = rNum / 255;
  const g = gNum / 255;
  const b = bNum / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0; 
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hexToHslString(hex: string): string | null {
    const hsl = hexToHsl(hex);
    if (!hsl) return null;
    return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

const applyThemeColors = (colors: ThemeColors) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, hexValue]) => {
    const hslString = hexToHslString(hexValue);
    if (hslString) {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, hslString);
    } else {
      console.warn(`Invalid hex color '${hexValue}' for theme key '${key}'. CSS variable not set.`);
    }
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
