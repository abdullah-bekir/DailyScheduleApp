import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSupabaseSession } from '../../context/SupabaseContext';
import { useTasks } from '../../context/TasksContext';
import { useTheme } from '../../context/ThemeContext';

/** Bulut senkronizasyon durumu (Ayarlar listesi ve detay ekranı aynı kaynağı kullanır). */
export default function useSyncStatus() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { supabaseConfigured, authReady, userId } = useSupabaseSession();
  const { tasksDataReady, tasksSyncError } = useTasks();

  return useMemo(() => {
    if (!supabaseConfigured) {
      return {
        tone: colors.textSecondary,
        label: t('settings.syncLocal'),
        detail: t('settings.syncLocalDetail'),
        icon: 'phone-portrait-outline',
      };
    }
    if (!authReady) {
      return {
        tone: colors.warning,
        label: t('settings.syncConnecting'),
        detail: t('settings.syncConnectingDetail'),
        icon: 'cloud-outline',
      };
    }
    if (!userId) {
      return {
        tone: colors.warning,
        label: t('settings.syncNoSession'),
        detail: t('settings.syncNoSessionDetail'),
        icon: 'cloud-offline-outline',
      };
    }
    if (!tasksDataReady) {
      return {
        tone: colors.primary,
        label: t('settings.syncProgress'),
        detail: t('settings.syncProgressDetail'),
        icon: 'sync-outline',
      };
    }
    if (tasksSyncError) {
      return {
        tone: colors.danger,
        label: t('settings.syncError'),
        detail: tasksSyncError,
        icon: 'alert-circle-outline',
      };
    }
    return {
      tone: colors.success,
      label: t('settings.syncActive'),
      detail: t('settings.syncActiveDetail'),
      icon: 'cloud-done-outline',
    };
  }, [supabaseConfigured, authReady, userId, tasksDataReady, tasksSyncError, colors, t]);
}
