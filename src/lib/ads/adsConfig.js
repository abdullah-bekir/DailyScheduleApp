import Constants from 'expo-constants';

/**
 * Reklamların gerçekten yüklenip gösterilmesi için ana anahtar.
 * Varsayılan: kapalı — kullanıcı arayüzünde reklam görünmez.
 * Açmak için: EXPO_PUBLIC_ADS_UI_ENABLED=true (.env)
 *
 * Açıkken: tam ekran geçişler `adFrequency` ile en az N dk aralıkla;
 * app open ayrı soğuma; ödüllü reklam isteğe bağlı bonus puan; banner yalnızca birkaç ekranda.
 */
export function isAdsUiEnabled() {
  const extra = Constants.expoConfig?.extra ?? {};
  return extra.adsUiEnabled === true;
}

/** Ödüllü reklam sonrası verilecek yerel tamamlama puanı (1–50, varsayılan 5). */
export function getAdsRewardBonusPoints() {
  const extra = Constants.expoConfig?.extra ?? {};
  const n = parseInt(String(extra.adsRewardBonusPoints ?? '5'), 10);
  return Number.isFinite(n) ? Math.min(50, Math.max(1, n)) : 5;
}
