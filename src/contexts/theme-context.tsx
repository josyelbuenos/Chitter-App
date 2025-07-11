'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { THEMES } from '@/lib/themes';

type Theme = 'dark' | 'light';
type PrimaryColor = typeof THEMES[number]['name'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
};

const applyPrimaryColor = (colorName: PrimaryColor) => {
  const color = THEMES.find(t => t.name === colorName);
  if (color) {
    const root = window.document.documentElement;
    root.style.setProperty('--primary', color.hsl);
    root.style.setProperty('--ring', color.hsl);
    // You might want to adjust sidebar colors too if they use --primary
    root.style.setProperty('--sidebar-primary', color.hsl);
    root.style.setProperty('--sidebar-ring', color.hsl);
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>('violet');

  useEffect(() => {
    const storedTheme = localStorage.getItem('chitter-theme') as Theme | null;
    const storedColor = localStorage.getItem('chitter-primary-color') as PrimaryColor | null;

    const initialTheme = storedTheme || 'dark';
    const initialColor = storedColor || 'violet';

    setThemeState(initialTheme);
    setPrimaryColorState(initialColor);

    applyTheme(initialTheme);
    applyPrimaryColor(initialColor);
  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('chitter-theme', newTheme);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setPrimaryColor = (newColor: PrimaryColor) => {
    localStorage.setItem('chitter-primary-color', newColor);
    setPrimaryColorState(newColor);
    applyPrimaryColor(newColor);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
