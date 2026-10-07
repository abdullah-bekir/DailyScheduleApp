import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppSettings } from '../../context/AppSettingsContext';
import { applyDailyReminderEnabled } from '../../utils/dailyReminderNotifications';

/** Keeps the daily local notification in sync with Settings → Notifications. */
export default function DailyReminderController() {
  const { hydrated, notificationsEnabled, setNotificationsEnabled } = useAppSettings();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'web' || !hydrated) return;
    let active = true;
    (async () => {
      const content = {
        title: t('reminder.dailyTitle'),
        body: t('reminder.dailyBody'),
      };
      const result = await applyDailyReminderEnabled(notificationsEnabled, content);
      if (!active) return;
      if (notificationsEnabled && result && !result.ok) {
        await setNotificationsEnabled(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [hydrated, notificationsEnabled, setNotificationsEnabled, t, i18n.language]);

  return null;
}
