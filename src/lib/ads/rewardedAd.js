import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isAdsUiEnabled } from './adsConfig';

function getRewardedUnitId() {
  const extra = Constants.expoConfig?.extra || {};
  if (Platform.OS === 'android') {
    return (
      extra.admobRewardedUnitIdAndroid ||
      extra.admobRewardedUnitId ||
      'ca-app-pub-3940256099942544/5224354917'
    );
  }
  return (
    extra.admobRewardedUnitIdIOS ||
    extra.admobRewardedUnitId ||
    'ca-app-pub-3940256099942544/1712485313'
  );
}

/**
 * Tek seferlik rewarded akışı — Interstitial ile ayrı sınıf ve ayrı birim ID kullanır (callback karışması yok).
 * @returns {{ shown: boolean, earned: boolean, reason?: string }}
 */
export async function showRewardedAd() {
  if (!isAdsUiEnabled()) {
    return { shown: false, earned: false, reason: 'disabled' };
  }
  if (Constants.appOwnership === 'expo') {
    return { shown: false, earned: false, reason: 'expo-go' };
  }

  try {
    const {
      RewardedAd,
      RewardedAdEventType,
      AdEventType,
    } = require('react-native-google-mobile-ads');

    const rewarded = RewardedAd.createForAdRequest(getRewardedUnitId());

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
        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
      );
      subs.push(
        rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          finish({ shown: true, earned });
        }),
      );
      subs.push(
        rewarded.addAdEventListener(AdEventType.ERROR, () => {
          finish({ shown: false, earned: false });
        }),
      );
      subs.push(
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
          rewarded.show();
        }),
      );

      rewarded.load();
    });
  } catch {
    return { shown: false, earned: false };
  }
}
