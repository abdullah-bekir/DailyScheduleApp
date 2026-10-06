import { Alert, Linking, Platform } from 'react-native';

import { PRIVACY_CONTACT_EMAIL, SUPPORT_EMAIL } from '../constants/legalUrls';

const SUBSCRIPTION_MANAGEMENT_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

function isMailtoUrl(url) {
  return typeof url === 'string' && url.toLowerCase().startsWith('mailto:');
}

export async function openExternalUrl(url, { errorTitle = 'Error', errorBody = 'Could not open link.' } = {}) {
  if (!url) return false;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can && !isMailtoUrl(url)) {
      Alert.alert(errorTitle, errorBody);
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    if (isMailtoUrl(url)) {
      try {
        await Linking.openURL(url);
        return true;
      } catch {
        /* fall through */
      }
    }
    Alert.alert(errorTitle, errorBody);
    return false;
  }
}

function buildMailtoUrl(email, subject) {
  const trimmed = typeof email === 'string' ? email.trim() : '';
  if (!trimmed) return null;
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${trimmed}${query}`;
}

export async function openSupportEmail(subject = 'Planly support') {
  return openExternalUrl(buildMailtoUrl(SUPPORT_EMAIL, subject));
}

export async function openPrivacyContactEmail(subject = 'Planly privacy request') {
  return openExternalUrl(buildMailtoUrl(PRIVACY_CONTACT_EMAIL, subject));
}

export async function openSubscriptionManagement() {
  return openExternalUrl(SUBSCRIPTION_MANAGEMENT_URL);
}
