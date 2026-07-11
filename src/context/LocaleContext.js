import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import * as Updates from 'expo-updates';

import i18n, { applyRtlLayout, getDateLocale, isRtlLanguage, SUPPORTED_LANGUAGES } from '../i18n';
import { pushProfilePatch } from '../lib/profileRemote';
import { loadLanguage, saveLanguage } from '../utils/appSettingsStorage';

const LocaleContext = createContext(null);
const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((language) => language.code);

function isSupportedLanguage(code) {
  return typeof code === 'string' && SUPPORTED_LANGUAGE_CODES.includes(code);
}

function normalizeLanguage(code) {
  return isSupportedLanguage(code) ? code : 'tr';
}

export function LocaleProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState(() => normalizeLanguage(i18n.language));
  const languageRef = useRef(language);

  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await loadLanguage(SUPPORTED_LANGUAGE_CODES);
      const code = saved ?? normalizeLanguage(i18n.resolvedLanguage || i18n.language);
      if (!active) return;
      applyRtlLayout(code);
      await i18n.changeLanguage(code);
      if (!active) return;
      languageRef.current = code;
      setLanguageState(code);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const applyLanguage = useCallback(async (next, { persist, reloadOnDirectionChange }) => {
    const prevRtl = isRtlLanguage(languageRef.current);
    const nextRtl = isRtlLanguage(next);
    if (persist) await saveLanguage(next, SUPPORTED_LANGUAGE_CODES);
    await i18n.changeLanguage(next);
    applyRtlLayout(next);
    languageRef.current = next;
    setLanguageState(next);
    if (reloadOnDirectionChange && prevRtl !== nextRtl) {
      Alert.alert(
        i18n.t('settings.languageTitle'),
        i18n.t('settings.languageHint'),
        [
          {
            text: i18n.t('common.ok'),
            onPress: async () => {
              try {
                await Updates.reloadAsync();
              } catch {
                /* dev */
              }
            },
          },
        ],
      );
    }
  }, []);

  const setLanguage = useCallback(async (code) => {
    const next = normalizeLanguage(code);
    await applyLanguage(next, { persist: true, reloadOnDirectionChange: true });
    pushProfilePatch({ language_code: next }).catch(() => {});
  }, [applyLanguage]);

  const applyRemoteLanguage = useCallback(async (code) => {
    if (!isSupportedLanguage(code)) return false;
    await applyLanguage(code, { persist: true, reloadOnDirectionChange: true });
    return true;
  }, [applyLanguage]);

  const dateLocale = useMemo(() => getDateLocale(language), [language]);
  const isRtl = useMemo(() => isRtlLanguage(language), [language]);

  const value = useMemo(
    () => ({
      ready,
      language,
      dateLocale,
      isRtl,
      setLanguage,
      applyRemoteLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [ready, language, dateLocale, isRtl, setLanguage, applyRemoteLanguage],
  );

  if (!ready) {
    return (
      <I18nextProvider i18n={i18n}>
        <LocaleContext.Provider
          value={{
            ready: false,
            language: 'tr',
            dateLocale: 'tr-TR',
            isRtl: false,
            setLanguage: async () => {},
            applyRemoteLanguage: async () => false,
            supportedLanguages: SUPPORTED_LANGUAGES,
          }}
        />
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
