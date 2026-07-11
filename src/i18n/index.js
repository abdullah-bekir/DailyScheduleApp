import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import hi from './locales/hi.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = Object.freeze([
  { code: 'tr', rtl: false },
  { code: 'en', rtl: false },
  { code: 'es', rtl: false },
  { code: 'de', rtl: false },
  { code: 'fr', rtl: false },
  { code: 'ar', rtl: true },
  { code: 'pt', rtl: false },
  { code: 'ru', rtl: false },
  { code: 'zh', rtl: false },
  { code: 'ja', rtl: false },
  { code: 'ko', rtl: false },
  { code: 'hi', rtl: false },
  { code: 'it', rtl: false },
]);

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
  ar: { translation: ar },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  hi: { translation: hi },
  it: { translation: it },
};

export function isRtlLanguage(code) {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.rtl === true;
}

export function applyRtlLayout(code) {
  const rtl = isRtlLanguage(code);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

export function getDateLocale(code) {
  const map = {
    tr: 'tr-TR',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
    ar: 'ar-SA',
    pt: 'pt-BR',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    hi: 'hi-IN',
    it: 'it-IT',
  };
  return map[code] ?? 'en-US';
}

// Uygulama her yeni kullanıcı için Türkçe açılır. Kullanıcının Ayarlar’dan
// yaptığı seçim LocaleProvider tarafından yerelden/buluttan geri yüklenir.
const defaultLanguage = 'tr';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
});

applyRtlLayout(defaultLanguage);

export default i18n;
