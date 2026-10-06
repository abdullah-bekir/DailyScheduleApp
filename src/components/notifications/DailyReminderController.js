import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSettings } from '../../context/AppSettingsContext';
import { applyDailyReminderEnabled } from '../../utils/dailyReminderNotifications';

/** Keeps the daily local notification in sync with Settings → Notifications. */
export default function DailyReminderController() {
  const { hydrated, notificationsEnabled } = useAppSettings();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    (async () => {
      const content = {
        title: t('reminder.dailyTitle'),
        body: t('reminder.dailyBody'),
      };
      if (!active) return;
      await applyDailyReminderEnabled(notificationsEnabled, content);
    })();
    return () => {
      active = false;
    };
  }, [hydrated, notificationsEnabled, t, i18n.language]);

  return null;
}
