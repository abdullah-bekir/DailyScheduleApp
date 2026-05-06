import { useEffect } from 'react';

import { useSupabaseSession } from '../../context/SupabaseContext';
import { useTasks } from '../../context/TasksContext';
import { useTheme } from '../../context/ThemeContext';
import { coerceBoolean } from '../../lib/taskRemote';
import { fetchProfile } from '../../lib/profileRemote';
import { saveNotificationsEnabled } from '../../utils/appSettingsStorage';

/**
 * Oturum ve görev bulutu hazır olduğunda profil (tema, bildirim, tamamlama puanı) sunucudan okunur;
 * tasksDataReady sonrası çalışır. UI eklenmez.
 */
export default function RemoteProfileSync() {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const { applyRemoteTheme } = useTheme();
  const { tasksDataReady, applyRemoteCompletionTally } = useTasks();

  useEffect(() => {
    if (!supabaseConfigured || !authReady || !userId || !tasksDataReady) return;
    let cancelled = false;
    (async () => {
      let profile = await fetchProfile();
      if (!profile && !cancelled) {
        await new Promise((r) => setTimeout(r, 450));
        profile = await fetchProfile();
      }
      if (cancelled || !profile) return;
      applyRemoteTheme(profile.theme_mode);
      await saveNotificationsEnabled(coerceBoolean(profile.notifications_enabled, true));
      applyRemoteCompletionTally(profile.completion_tally);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    supabaseConfigured,
    authReady,
    userId,
    tasksDataReady,
    applyRemoteTheme,
    applyRemoteCompletionTally,
  ]);

  return null;
}
