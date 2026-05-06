import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { pushProfilePatch } from '../lib/profileRemote';
import { darkPalette, lightPalette } from '../theme/palettes';
import { loadThemeMode, saveThemeMode } from '../utils/appSettingsStorage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadThemeMode();
      if (!cancelled) {
        setMode(stored);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyRemoteTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return;
    setMode(next);
    saveThemeMode(next);
  }, []);

  const setThemeMode = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return;
    setMode(next);
    saveThemeMode(next);
    pushProfilePatch({ theme_mode: next });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      saveThemeMode(next);
      pushProfilePatch({ theme_mode: next });
      return next;
    });
  }, []);

  const colors = useMemo(() => (mode === 'dark' ? darkPalette : lightPalette), [mode]);

  const value = useMemo(
    () => ({
      mode,
      colors,
      isDark: mode === 'dark',
      themeReady: ready,
      setThemeMode,
      toggleTheme,
      applyRemoteTheme,
    }),
    [mode, colors, ready, setThemeMode, toggleTheme, applyRemoteTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
