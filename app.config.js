// Expo: app.json içeriği `config` olarak gelir; .env içindeki EXPO_PUBLIC_* burada extra'ya da yazılır
// (bazı ortamlarda process.env okunur, Constants.expoConfig.extra yedek olur).

export default ({ config }) => ({
  ...config,
  /** Bare workflow (android/ klasörü var): runtimeVersion metin olmalı; policy kullanılamaz. app.json version ile hizalı tutulur. */
  runtimeVersion: String(config.version ?? '1.0.0'),
  plugins: [
    ...(config.plugins || []),
    'expo-updates',
    'expo-font',
    '@react-native-community/datetimepicker',
    [
      'react-native-google-mobile-ads',
      {
        androidAppId:
          process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713',
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
  ],
  extra: {
    ...config.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    admobBannerUnitId:
      process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID || 'ca-app-pub-3940256099942544/6300978111',
    admobBannerUnitIdAndroid:
      process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID_UNIT_ID || 'ca-app-pub-3940256099942544/6300978111',
    admobBannerUnitIdIOS:
      process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS_UNIT_ID || 'ca-app-pub-3940256099942544/2934735716',
    admobInterstitialUnitId:
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID || 'ca-app-pub-3940256099942544/1033173712',
    admobInterstitialUnitIdAndroid:
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID ||
      'ca-app-pub-3940256099942544/1033173712',
    admobInterstitialUnitIdIOS:
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID ||
      'ca-app-pub-3940256099942544/4411468910',
    admobRewardedUnitId:
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID || 'ca-app-pub-3940256099942544/5224354917',
    admobRewardedUnitIdAndroid:
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID ||
      'ca-app-pub-3940256099942544/5224354917',
    admobRewardedUnitIdIOS:
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID ||
      'ca-app-pub-3940256099942544/1712485313',
    revenueCatApiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
    revenueCatApiKeyIOS: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
    revenueCatEntitlementId: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? 'premium',
    /** Reklamları göstermek için EXPO_PUBLIC_ADS_UI_ENABLED=true (varsayılan kapalı) */
    adsUiEnabled: process.env.EXPO_PUBLIC_ADS_UI_ENABLED === 'true',
    /** Tam ekran interstitial: en az bu kadar dakika arayla (4–120, varsayılan 15) */
    adsMinInterstitialMinutes:
      Math.min(120, Math.max(4, parseInt(process.env.EXPO_PUBLIC_ADS_MIN_INTERSTITIAL_MINUTES || '15', 10) || 15)),
    /** App open: en az bu kadar dakika arayla (10–180, varsayılan 30) */
    adsMinAppOpenMinutes:
      Math.min(180, Math.max(10, parseInt(process.env.EXPO_PUBLIC_ADS_MIN_APPOPEN_MINUTES || '30', 10) || 30)),
    /** Ödüllü reklam bonusu: tamamlama puanı (1–50, varsayılan 5) */
    adsRewardBonusPoints:
      Math.min(50, Math.max(1, parseInt(process.env.EXPO_PUBLIC_ADS_REWARD_BONUS_POINTS || '5', 10) || 5)),
    admobAppOpenUnitId:
      process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_UNIT_ID || 'ca-app-pub-3940256099942544/9257395921',
    admobAppOpenUnitIdAndroid:
      process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_UNIT_ID ||
      'ca-app-pub-3940256099942544/9257395921',
    admobAppOpenUnitIdIOS:
      process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_IOS_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_UNIT_ID ||
      'ca-app-pub-3940256099942544/5575463023',
    admobRewardedInterstitialUnitId:
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_UNIT_ID ||
      'ca-app-pub-3940256099942544/5354046379',
    admobRewardedInterstitialUnitIdAndroid:
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_ANDROID_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_UNIT_ID ||
      'ca-app-pub-3940256099942544/5354046379',
    admobRewardedInterstitialUnitIdIOS:
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_IOS_UNIT_ID ||
      process.env.EXPO_PUBLIC_ADMOB_REWARDED_INTERSTITIAL_UNIT_ID ||
      'ca-app-pub-3940256099942544/6978759866',
  },
});
