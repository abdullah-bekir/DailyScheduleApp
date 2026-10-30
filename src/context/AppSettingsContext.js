import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { pushProfilePatch } from '../lib/profileRemote';
import {
  DAILY_PLAN_GOAL_OPTIONS,
  DEFAULT_DAILY_PLAN_GOAL,
  loadDailyPlanGoal,
  loadNotificationsEnabled,
  saveDailyPlanGoal,
  saveNotificationsEnabled,
} from '../utils/appSettingsStorage';

import { useSupabaseSession } from './SupabaseContext';

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const storageUserId = supabaseConfigured ? userId : null;
  const [dailyPlanGoal, setDailyPlanGoalState] = useState(DEFAULT_DAILY_PLAN_GOAL);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const notificationsEnabledRef = useRef(true);

  useEffect(() => {
    let active = true;
    setHydrated(false);
    if (supabaseConfigured && !authReady) {
      return () => {
        active = false;
      };
    }
    (async () => {
      try {
        const [goal, notify] = await Promise.all([
          loadDailyPlanGoal(storageUserId),
          loadNotificationsEnabled(storageUserId),
        ]);
        if (!active) return;
        setDailyPlanGoalState(goal);
        notificationsEnabledRef.current = notify;
        setNotificationsEnabledState(notify);
      } catch {
        if (!active) return;
        setDailyPlanGoalState(DEFAULT_DAILY_PLAN_GOAL);
        notificationsEnabledRef.current = true;
        setNotificationsEnabledState(true);
      }
      setHydrated(true);
    })();
    return () => {
      active = false;
    };
  }, [supabaseConfigured, authReady, storageUserId]);

  const setDailyPlanGoal = useCallback(
    async (goal) => {
      const n = DAILY_PLAN_GOAL_OPTIONS.includes(goal) ? goal : DEFAULT_DAILY_PLAN_GOAL;
      setDailyPlanGoalState(n);
      await saveDailyPlanGoal(n, storageUserId);
    },
    [storageUserId],
  );

  const setNotificationsEnabled = useCallback(
    async (enabled) => {
      const value = Boolean(enabled);
      const previous = notificationsEnabledRef.current;
      notificationsEnabledRef.current = value;
      setNotificationsEnabledState(value);
      await saveNotificationsEnabled(value, storageUserId);
      if (!supabaseConfigured) return { ok: true };
      let result;
      try {
        result = (await pushProfilePatch({ notifications_enabled: value })) ?? { ok: false };
      } catch (error) {
        result = { ok: false, error };
      }
      const localOnly = result.error === 'no_client' || result.error === 'no_session';
      if (!result.ok && !localOnly) {
        notificationsEnabledRef.current = previous;
        setNotificationsEnabledState(previous);
        await saveNotificationsEnabled(previous, storageUserId);
      }
      return result;
    },
    [storageUserId, supabaseConfigured],
  );

  const applyRemoteNotificationsEnabled = useCallback(
    async (enabled) => {
      const value = Boolean(enabled);
      notificationsEnabledRef.current = value;
      setNotificationsEnabledState(value);
      await saveNotificationsEnabled(value, storageUserId);
    },
    [storageUserId],
  );

  const value = useMemo(
    () => ({
      hydrated,
      dailyPlanGoal,
      notificationsEnabled,
      setDailyPlanGoal,
      setNotificationsEnabled,
      applyRemoteNotificationsEnabled,
    }),
    [
      hydrated,
      dailyPlanGoal,
      notificationsEnabled,
      setDailyPlanGoal,
      setNotificationsEnabled,
      applyRemoteNotificationsEnabled,
    ],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return ctx;
}
