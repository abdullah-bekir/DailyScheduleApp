import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_THEME_KEY = '@dailyschedule/settings_theme';
export const SETTINGS_NOTIFY_KEY = '@dailyschedule/settings_notify';
export const SETTINGS_DAILY_PLAN_GOAL_KEY = '@dailyschedule/settings_daily_plan_goal';

/** Ana sayfa «Bugünün özeti» çubuğunda plan yarısı için günlük görev ölçeği — kullanıcı seçer. */
export const DAILY_PLAN_GOAL_OPTIONS = Object.freeze([3, 5, 8, 10, 15, 20]);
export const DEFAULT_DAILY_PLAN_GOAL = 8;

export async function loadDailyPlanGoal() {
  try {
    const v = await AsyncStorage.getItem(SETTINGS_DAILY_PLAN_GOAL_KEY);
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && DAILY_PLAN_GOAL_OPTIONS.includes(n)) return n;
    // Eski sürümde 6 seçenekti; yeni listede yok — varsayılan 8’e taşı.
    if (Number.isFinite(n) && n === 6) {
      await saveDailyPlanGoal(DEFAULT_DAILY_PLAN_GOAL);
      return DEFAULT_DAILY_PLAN_GOAL;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_DAILY_PLAN_GOAL;
}

export async function saveDailyPlanGoal(goal) {
  try {
    const n = DAILY_PLAN_GOAL_OPTIONS.includes(goal) ? goal : DEFAULT_DAILY_PLAN_GOAL;
    await AsyncStorage.setItem(SETTINGS_DAILY_PLAN_GOAL_KEY, String(n));
  } catch {
    /* ignore */
  }
}

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
