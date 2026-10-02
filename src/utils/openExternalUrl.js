import { Alert, Linking, Platform } from 'react-native';

import { SUPPORT_EMAIL } from '../constants/legalUrls';

const SUBSCRIPTION_MANAGEMENT_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

export async function openExternalUrl(url, { errorTitle = 'Error', errorBody = 'Could not open link.' } = {}) {
  if (!url) return false;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert(errorTitle, errorBody);
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert(errorTitle, errorBody);
    return false;
  }
}

export async function openSupportEmail(subject = 'Planly support') {
  const url = `mailto:${encodeURIComponent(SUPPORT_EMAIL)}?subject=${encodeURIComponent(subject)}`;
  return openExternalUrl(url);
}

export async function openSubscriptionManagement() {
  return openExternalUrl(SUBSCRIPTION_MANAGEMENT_URL);
}
