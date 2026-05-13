import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isAdsUiEnabled } from './adsConfig';

function getRewardedInterstitialUnitId() {
  const extra = Constants.expoConfig?.extra || {};
  if (Platform.OS === 'android') {
    return (
      extra.admobRewardedInterstitialUnitIdAndroid ||
      extra.admobRewardedInterstitialUnitId ||
      'ca-app-pub-3940256099942544/5354046379'
    );
  }
  return (
    extra.admobRewardedInterstitialUnitIdIOS ||
    extra.admobRewardedInterstitialUnitId ||
    'ca-app-pub-3940256099942544/6978759866'
  );
}

/**
 * Önbellek yok — istek üzerine yüklenir (rewarded ile aynı model).
 * Tam ekran önceliği: önce interstitial + app open registerAdFormats içinde hazırlanır.
 */
export function prepareRewardedInterstitialAd() {
  /* no-op: warm-up isteğe bağlı; gösterim showRewardedInterstitialAd ile */
}

/**
 * @returns {{ shown: boolean, earned: boolean, reason?: string }}
 */
export async function showRewardedInterstitialAd() {
  if (!isAdsUiEnabled()) {
    return { shown: false, earned: false, reason: 'disabled' };
  }
  if (Constants.appOwnership === 'expo') {
    return { shown: false, earned: false, reason: 'expo-go' };
  }

  try {
    const {
      RewardedInterstitialAd,
      RewardedAdEventType,
      AdEventType,
    } = require('react-native-google-mobile-ads');

    const ri = RewardedInterstitialAd.createForAdRequest(getRewardedInterstitialUnitId());

    return await new Promise((resolve) => {
      let earned = false;
      let finished = false;

      const finish = (payload) => {
        if (finished) return;
        finished = true;
        detach();
        resolve(payload);
      };

      const subs = [];

      const detach = () => {
        subs.forEach((unsub) => {
          try {
            unsub();
          } catch {
            /* noop */
          }
        });
        subs.length = 0;
      };

      subs.push(
        ri.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
      );
      subs.push(
        ri.addAdEventListener(AdEventType.CLOSED, () => {
          finish({ shown: true, earned });
        }),
      );
      subs.push(
        ri.addAdEventListener(AdEventType.ERROR, () => {
          finish({ shown: false, earned: false });
        }),
      );
      subs.push(
        ri.addAdEventListener(RewardedAdEventType.LOADED, () => {
          ri.show();
        }),
      );

      ri.load();
    });
  } catch {
    return { shown: false, earned: false };
  }
}
