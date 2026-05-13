import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const KEY_INTERSTITIAL_AT = '@dailyschedule/ads_last_interstitial_at';
const KEY_APP_OPEN_AT = '@dailyschedule/ads_last_appopen_at';

function extra() {
  return Constants.expoConfig?.extra ?? {};
}

/** Tam ekran geçiş reklamları: varsayılan 15 dk (4–120 arası). */
export function getInterstitialCooldownMs() {
  const m = parseInt(String(extra().adsMinInterstitialMinutes ?? '15'), 10);
  const safe = Number.isFinite(m) ? Math.min(120, Math.max(4, m)) : 15;
  return safe * 60 * 1000;
}

/** App open: varsayılan 30 dk (10–180 arası). */
export function getAppOpenCooldownMs() {
  const m = parseInt(String(extra().adsMinAppOpenMinutes ?? '30'), 10);
  const safe = Number.isFinite(m) ? Math.min(180, Math.max(10, m)) : 30;
  return safe * 60 * 1000;
}

export async function canShowInterstitialNow() {
  const raw = await AsyncStorage.getItem(KEY_INTERSTITIAL_AT);
  if (!raw) return true;
  const t = parseInt(raw, 10);
  if (Number.isNaN(t)) return true;
  return Date.now() - t >= getInterstitialCooldownMs();
}

export async function markInterstitialShown() {
  await AsyncStorage.setItem(KEY_INTERSTITIAL_AT, String(Date.now()));
}

export async function canShowAppOpenNow() {
  const raw = await AsyncStorage.getItem(KEY_APP_OPEN_AT);
  if (!raw) return true;
  const t = parseInt(raw, 10);
  if (Number.isNaN(t)) return true;
  return Date.now() - t >= getAppOpenCooldownMs();
}

export async function markAppOpenShown() {
  await AsyncStorage.setItem(KEY_APP_OPEN_AT, String(Date.now()));
}
