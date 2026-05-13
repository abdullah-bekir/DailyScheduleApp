import { isAdsUiEnabled } from './adsConfig';
import { prepareInterstitialAds } from './interstitialAd';
import { prepareAppOpenAd } from './appOpenAd';
import { prepareRewardedInterstitialAd } from './rewardedInterstitialAd';

/**
 * Tam ekran ve ödüllü formatları Google’ın önerdiği sırayla hazırlar (yüksekten düşüğe öncelik).
 * Yalnızca isAdsUiEnabled() true iken çalışır.
 */
export function registerAllAdFormatsInOrder() {
  if (!isAdsUiEnabled()) return;
  prepareInterstitialAds();
  prepareAppOpenAd();
  prepareRewardedInterstitialAd();
}
