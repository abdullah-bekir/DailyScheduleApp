import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_THEME_KEY = '@dailyschedule/settings_theme';
export const SETTINGS_NOTIFY_KEY = '@dailyschedule/settings_notify';

export async function loadThemeMode() {
  try {
    const v = await AsyncStorage.getItem(SETTINGS_THEME_KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return 'light';
}

export async function saveThemeMode(mode) {
  try {
    await AsyncStorage.setItem(SETTINGS_THEME_KEY, mode);
  } catch {
    /* ignore */
  }
}

export async function loadNotificationsEnabled() {
  try {
    const v = await AsyncStorage.getItem(SETTINGS_NOTIFY_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {
    /* ignore */
  }
  return true;
}

export async function saveNotificationsEnabled(enabled) {
  try {
    await AsyncStorage.setItem(SETTINGS_NOTIFY_KEY, enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}
