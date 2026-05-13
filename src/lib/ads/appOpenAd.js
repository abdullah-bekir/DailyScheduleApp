import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isAdsUiEnabled } from './adsConfig';
import { canShowAppOpenNow, markAppOpenShown } from './adFrequency';

let appOpen = null;
let loaded = false;
let loading = false;
let prepared = false;

function getAppOpenUnitId() {
  const extra = Constants.expoConfig?.extra || {};
  if (Platform.OS === 'android') {
    return (
      extra.admobAppOpenUnitIdAndroid ||
      extra.admobAppOpenUnitId ||
      'ca-app-pub-3940256099942544/9257395921'
    );
  }
  return (
    extra.admobAppOpenUnitIdIOS ||
    extra.admobAppOpenUnitId ||
    'ca-app-pub-3940256099942544/5575463023'
  );
}

function ensureAppOpen() {
  if (!isAdsUiEnabled()) return false;
  if (Constants.appOwnership === 'expo') return false;
  if (appOpen) return true;
  try {
    const { AppOpenAd, AdEventType } = require('react-native-google-mobile-ads');
    appOpen = AppOpenAd.createForAdRequest(getAppOpenUnitId());
    appOpen.addAdEventListener(AdEventType.LOADED, () => {
      loaded = true;
      loading = false;
    });
    appOpen.addAdEventListener(AdEventType.CLOSED, () => {
      loaded = false;
      markAppOpenShown().catch(() => {});
      loadAppOpen();
    });
    appOpen.addAdEventListener(AdEventType.ERROR, () => {
      loaded = false;
      loading = false;
    });
    return true;
  } catch {
    return false;
  }
}

function loadAppOpen() {
  if (!ensureAppOpen()) return;
  if (loaded || loading) return;
  loading = true;
  appOpen.load();
}

/** registerAdFormats sırasında — app open önbelleğe alınır */
export function prepareAppOpenAd() {
  if (!isAdsUiEnabled()) return;
  if (prepared) return;
  prepared = true;
  loadAppOpen();
}

export async function showAppOpenIfReady() {
  if (!isAdsUiEnabled()) return false;
  if (!(await canShowAppOpenNow())) return false;
  if (!ensureAppOpen()) return false;
  if (!loaded) return false;
  try {
    await appOpen.show();
    return true;
  } catch {
    return false;
  }
}
