import Constants from 'expo-constants';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { cardShadow } from '../../theme/shadows';
import { isAdsUiEnabled } from '../../lib/ads/adsConfig';

function createStyles(colors) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      minHeight: 64,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...cardShadow(colors, 'sm'),
    },
  });
}

function getBannerUnitId() {
  const extra = Constants.expoConfig?.extra || {};
  if (Platform.OS === 'android') {
    return (
      extra.admobBannerUnitIdAndroid ||
      extra.admobBannerUnitId ||
      'ca-app-pub-3940256099942544/6300978111'
    );
  }
  return (
    extra.admobBannerUnitIdIOS ||
    extra.admobBannerUnitId ||
    'ca-app-pub-3940256099942544/2934735716'
  );
}

export default function AdMobBannerCard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!isAdsUiEnabled()) return null;

  // Expo Go'da native ads modülü yüklenmez; sadece dev build/release'te göster.
  if (Constants.appOwnership === 'expo') return null;

  let BannerAd = null;
  let BannerAdSize = null;
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <BannerAd unitId={getBannerUnitId()} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
