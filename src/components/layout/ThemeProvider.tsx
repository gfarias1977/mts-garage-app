'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeVariant = 'light' | 'dark' | 'semi-dark';

interface ThemeContextValue {
  theme: ThemeVariant;
  setTheme: (t: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeVariant>('light');

  useEffect(() => {
    const stored = localStorage.getItem('mts-theme') as ThemeVariant | null;
    if (stored) applyTheme(stored);
  }, []);

  const applyTheme = (t: ThemeVariant) => {
    setThemeState(t);
    document.documentElement.classList.remove('dark', 'semi-dark');
    if (t !== 'light') {
      document.documentElement.classList.add(t);
    }
    localStorage.setItem('mts-theme', t);
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, setTheme: applyTheme } },
    children,
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
