'use client';

import { createContext, useContext, useCallback } from 'react';
import { useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

const themeListeners = new Set<() => void>();
let currentTheme: Theme = 'dark';

const subscribe = (callback: () => void) => {
  themeListeners.add(callback);
  return () => themeListeners.delete(callback);
};

const getSnapshot = () => currentTheme;
const getServerSnapshot = (): Theme => 'dark';

export function applyTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  document.documentElement.style.colorScheme = theme;
  currentTheme = theme;
  themeListeners.forEach((l) => l());
}

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('theme', next);
    } catch {
      // ignore
    }
    applyTheme(next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
