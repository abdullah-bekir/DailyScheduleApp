import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useSubscription } from '../../context/SubscriptionContext';
import { isAdsUiEnabled } from '../../lib/ads/adsConfig';
import { showAppOpenIfReady } from '../../lib/ads/appOpenAd';

/**
 * Uygulama arka plandan öne gelince app open tam ekran (yalnızca free + reklam anahtarı açık).
 */
export default function AppOpenAdController() {
  const { isPro, ready } = useSubscription();
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (Constants.appOwnership === 'expo') return undefined;
    // ready olmadan reklam yok: Pro durumu netleşmeden flash olmasın
    if (!isAdsUiEnabled() || !ready || isPro) return undefined;

    const sub = AppState.addEventListener('change', (next) => {
      if (appStateRef.current.match(/inactive|background/) && next === 'active') {
        showAppOpenIfReady();
      }
      appStateRef.current = next;
    });

    return () => sub.remove();
  }, [isPro, ready]);

  return null;
}
