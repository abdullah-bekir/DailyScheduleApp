import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const DAILY_REMINDER_NOTIFICATION_ID = 'planly-daily-reminder';

/** Local hour (0–23) for the once-per-day nudge. */
export const DAILY_REMINDER_HOUR = 9;
export const DAILY_REMINDER_MINUTE = 0;

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('planly-reminders', {
    name: 'Planly reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

function isNativeReminderEnvironment() {
  return Platform.OS !== 'web' && Constants.appOwnership !== 'expo';
}

export async function getDailyReminderPermissionStatus() {
  if (Platform.OS === 'web') {
    return { granted: false, canAskAgain: false, expoGo: false };
  }
  if (Constants.appOwnership === 'expo') {
    return { granted: false, canAskAgain: true, expoGo: true };
  }
  const settings = await Notifications.getPermissionsAsync();
  return {
    granted: settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    canAskAgain: settings.canAskAgain !== false,
    expoGo: false,
  };
}

export async function requestDailyReminderPermissions() {
  if (Platform.OS === 'web') {
    return { granted: false, canAskAgain: false, expoGo: false };
  }
  if (Constants.appOwnership === 'expo') {
    return { granted: false, canAskAgain: true, expoGo: true };
  }
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return { granted: true, canAskAgain: true, expoGo: false };
  }
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  const granted =
    requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  return { granted, canAskAgain: requested.canAskAgain !== false, expoGo: false };
}

export async function cancelDailyReminder() {
  if (!isNativeReminderEnvironment()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_NOTIFICATION_ID);
  } catch {
    // ignore
  }
}

/**
 * @param {{ title: string, body: string }} content
 */
export async function scheduleDailyReminder(content) {
  if (Platform.OS === 'web') return { ok: false, reason: 'web' };
  if (Constants.appOwnership === 'expo') return { ok: false, reason: 'expo_go' };
  if (!content?.title || !content?.body) {
    return { ok: false, reason: 'missing_content' };
  }
  try {
    await ensureAndroidChannel();
    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_NOTIFICATION_ID,
      content: {
        title: content.title,
        body: content.body,
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: 'planly-reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: DAILY_REMINDER_HOUR,
        minute: DAILY_REMINDER_MINUTE,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'schedule_failed' };
  }
}

export async function applyDailyReminderEnabled(enabled, content) {
  if (!enabled) {
    await cancelDailyReminder();
    return { ok: true };
  }
  const perm = await getDailyReminderPermissionStatus();
  if (!perm.granted) {
    return { ok: false, reason: 'no_permission' };
  }
  return scheduleDailyReminder(content);
}
