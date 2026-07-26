import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_THEME_KEY = '@dailyschedule/settings_theme';
export const SETTINGS_NOTIFY_KEY = '@dailyschedule/settings_notify';
export const SETTINGS_LANGUAGE_KEY = '@dailyschedule/settings_language';
export const SETTINGS_DAILY_PLAN_GOAL_KEY = '@dailyschedule/settings_daily_plan_goal';
const SETTINGS_MIGRATION_PREFIX = '@dailyschedule/settings_migrated_user';

function userScopedKey(key, userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  return id ? `${key}:${id}` : key;
}

function migrationKey(key) {
  return `${SETTINGS_MIGRATION_PREFIX}:${key}`;
}

async function migrateLegacySetting(key, userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  if (!id) return;

  const targetKey = userScopedKey(key, id);
  const [migrationOwner, target, legacy] = await Promise.all([
    AsyncStorage.getItem(migrationKey(key)),
    AsyncStorage.getItem(targetKey),
    AsyncStorage.getItem(key),
  ]);

  if (!migrationOwner && target == null && legacy != null) {
    await AsyncStorage.setItem(targetKey, legacy);
  }
  if (!migrationOwner) {
    await AsyncStorage.setItem(migrationKey(key), id);
  }
}

async function readSetting(key, userId) {
  await migrateLegacySetting(key, userId);
  return AsyncStorage.getItem(userScopedKey(key, userId));
}

async function writeSetting(key, value, userId) {
  await AsyncStorage.setItem(userScopedKey(key, userId), value);
}

/** Ana sayfa «Bugünün özeti» çubuğunda plan yarısı için günlük görev ölçeği — kullanıcı seçer. */
export const DAILY_PLAN_GOAL_OPTIONS = Object.freeze([3, 5, 8, 10, 15, 20]);
export const DEFAULT_DAILY_PLAN_GOAL = 8;

export async function loadDailyPlanGoal(userId) {
  try {
    const v = await readSetting(SETTINGS_DAILY_PLAN_GOAL_KEY, userId);
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && DAILY_PLAN_GOAL_OPTIONS.includes(n)) return n;
    // Eski sürümde 6 seçenekti; yeni listede yok — varsayılan 8’e taşı.
    if (Number.isFinite(n) && n === 6) {
      await saveDailyPlanGoal(DEFAULT_DAILY_PLAN_GOAL, userId);
      return DEFAULT_DAILY_PLAN_GOAL;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_DAILY_PLAN_GOAL;
}

export async function saveDailyPlanGoal(goal, userId) {
  try {
    const n = DAILY_PLAN_GOAL_OPTIONS.includes(goal) ? goal : DEFAULT_DAILY_PLAN_GOAL;
    await writeSetting(SETTINGS_DAILY_PLAN_GOAL_KEY, String(n), userId);
  } catch {
    /* ignore */
  }
}

export async function loadThemeMode(userId) {
  try {
    const v = await readSetting(SETTINGS_THEME_KEY, userId);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return 'light';
}

export async function saveThemeMode(mode, userId) {
  try {
    await writeSetting(SETTINGS_THEME_KEY, mode, userId);
  } catch {
    /* ignore */
  }
}

export async function loadNotificationsEnabled(userId) {
  try {
    const v = await readSetting(SETTINGS_NOTIFY_KEY, userId);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {
    /* ignore */
  }
  return true;
}

export async function saveNotificationsEnabled(enabled, userId) {
  try {
    await writeSetting(SETTINGS_NOTIFY_KEY, enabled ? '1' : '0', userId);
  } catch {
    /* ignore */
  }
}

function isAllowedLanguage(code, allowedCodes) {
  return Array.isArray(allowedCodes) && allowedCodes.includes(code);
}

export async function loadLanguage(allowedCodes, userId) {
  try {
    const v = await readSetting(SETTINGS_LANGUAGE_KEY, userId);
    const code = typeof v === 'string' ? v.trim() : '';
    if (code && isAllowedLanguage(code, allowedCodes)) return code;
  } catch {
    /* ignore */
  }
  return null;
}

export async function saveLanguage(code, allowedCodes, userId) {
  try {
    if (isAllowedLanguage(code, allowedCodes)) {
      await writeSetting(SETTINGS_LANGUAGE_KEY, code, userId);
    }
  } catch {
    /* ignore */
  }
}
