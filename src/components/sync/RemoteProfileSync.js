import { useEffect, useRef } from 'react';

import { useSupabaseSession } from '../../context/SupabaseContext';
import { useTasks } from '../../context/TasksContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { coerceBoolean } from '../../lib/taskRemote';
import { fetchProfile } from '../../lib/profileRemote';
import { saveNotificationsEnabled } from '../../utils/appSettingsStorage';

/**
 * Oturum ve görev bulutu hazır olduğunda profil (tema, bildirim, tamamlama puanı) sunucudan okunur;
 * tasksDataReady sonrası çalışır. UI eklenmez.
 */
export default function RemoteProfileSync() {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const { language, applyRemoteLanguage } = useLocale();
  const { themeMode, applyRemoteTheme } = useTheme();
  const { tasksDataReady, completionTally, applyRemoteCompletionTally, reportTasksSyncError } = useTasks();
  const preferencesRef = useRef({ language, themeMode, completionTally });
  const syncedUserRef = useRef(null);
  const userIdRef = useRef(userId);

  preferencesRef.current = { language, themeMode, completionTally };
  userIdRef.current = userId;

  useEffect(() => {
    if (!supabaseConfigured || !authReady || !userId || !tasksDataReady) return;
    if (syncedUserRef.current === userId) return;

    let cancelled = false;
    const initialPreferences = preferencesRef.current;
    (async () => {
      let profileResult = await fetchProfile();
      if (!profileResult.ok && !cancelled) {
        await new Promise((r) => setTimeout(r, 450));
        profileResult = await fetchProfile();
      }
      if (cancelled || userIdRef.current !== userId) return;
      if (!profileResult.ok) {
        reportTasksSyncError(profileResult.error);
        return;
      }
      syncedUserRef.current = userId;
      const profile = profileResult.data;
      if (!profile) return;
      const currentPreferences = preferencesRef.current;

      if (currentPreferences.themeMode === initialPreferences.themeMode) {
        applyRemoteTheme(profile.theme_mode);
      }
      if (currentPreferences.completionTally === initialPreferences.completionTally) {
        applyRemoteCompletionTally(profile.completion_tally);
      }
      if (profile.language_code && currentPreferences.language === initialPreferences.language) {
        await applyRemoteLanguage(profile.language_code);
      }
      await saveNotificationsEnabled(coerceBoolean(profile.notifications_enabled, true), userId);
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
    applyRemoteLanguage,
    reportTasksSyncError,
    language,
    themeMode,
    completionTally,
  ]);

  return null;
}
