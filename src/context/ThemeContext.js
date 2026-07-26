import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { pushProfilePatch } from '../lib/profileRemote';
import { darkPalette, lightPalette } from '../theme/palettes';
import { loadThemeMode, saveThemeMode } from '../utils/appSettingsStorage';

import { useSupabaseSession } from './SupabaseContext';

const ThemeContext = createContext(null);

function normalizeRemoteMode(mode) {
  if (mode === true || mode === 'dark') return 'dark';
  return 'light';
}

export function ThemeProvider({ children }) {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const [themeMode, setThemeModeState] = useState('light');
  const [hydrated, setHydrated] = useState(false);
  const storageUserId = supabaseConfigured ? userId : null;

  useEffect(() => {
    let active = true;
    setHydrated(false);
    if (supabaseConfigured && !authReady) return () => {
      active = false;
    };
    loadThemeMode(storageUserId).then((m) => {
      if (active) {
        setThemeModeState(normalizeRemoteMode(m));
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, [supabaseConfigured, authReady, storageUserId]);

  const isDark = themeMode === 'dark';
  const colors = useMemo(() => (isDark ? darkPalette : lightPalette), [isDark]);

  const setThemeMode = useCallback(async (mode) => {
    const next = normalizeRemoteMode(mode);
    setThemeModeState(next);
    saveThemeMode(next, storageUserId);
    if (!supabaseConfigured) return;
    await pushProfilePatch({ theme_mode: next });
  }, [storageUserId, supabaseConfigured]);

  const applyRemoteTheme = useCallback((mode) => {
    if (mode !== 'dark' && mode !== 'light') return;
    setThemeModeState(mode);
    saveThemeMode(mode, storageUserId);
  }, [storageUserId]);

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      colors,
      setThemeMode,
      applyRemoteTheme,
      hydrated,
    }),
    [themeMode, isDark, colors, setThemeMode, applyRemoteTheme, hydrated],
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
