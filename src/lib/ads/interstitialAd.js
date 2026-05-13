import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isAdsUiEnabled } from './adsConfig';
import { canShowInterstitialNow, markInterstitialShown } from './adFrequency';

let interstitial = null;
let isLoaded = false;
let isLoading = false;
let initDone = false;

function getInterstitialUnitId() {
  const extra = Constants.expoConfig?.extra || {};
  if (Platform.OS === 'android') {
    return (
      extra.admobInterstitialUnitIdAndroid ||
      extra.admobInterstitialUnitId ||
      'ca-app-pub-3940256099942544/1033173712'
    );
  }
  return (
    extra.admobInterstitialUnitIdIOS ||
    extra.admobInterstitialUnitId ||
    'ca-app-pub-3940256099942544/4411468910'
  );
}

function ensureInterstitial() {
  if (!isAdsUiEnabled()) return false;
  if (Constants.appOwnership === 'expo') return false;
  if (interstitial) return true;

  try {
    const ads = require('react-native-google-mobile-ads');
    const { InterstitialAd, AdEventType } = ads;
    interstitial = InterstitialAd.createForAdRequest(getInterstitialUnitId());
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
      isLoading = false;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      isLoaded = false;
      markInterstitialShown().catch(() => {});
      loadInterstitial();
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      isLoaded = false;
      isLoading = false;
    });
    return true;
  } catch {
    return false;
  }
}

export function loadInterstitial() {
  if (!isAdsUiEnabled()) return;
  if (!ensureInterstitial()) return;
  if (isLoaded || isLoading) return;
  isLoading = true;
  interstitial.load();
}

export function prepareInterstitialAds() {
  if (!isAdsUiEnabled()) return;
  if (initDone) return;
  initDone = true;
  loadInterstitial();
}

export async function showInterstitialIfReady() {
  if (!isAdsUiEnabled()) return false;
  if (!(await canShowInterstitialNow())) return false;
  if (!ensureInterstitial()) return false;
  if (!isLoaded) return false;
  try {
    await interstitial.show();
    return true;
  } catch {
    return false;
  }
}
