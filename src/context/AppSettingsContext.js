import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    let active = true;
    setHydrated(false);
    if (supabaseConfigured && !authReady) {
      return () => {
        active = false;
      };
    }
    (async () => {
      const [goal, notify] = await Promise.all([
        loadDailyPlanGoal(storageUserId),
        loadNotificationsEnabled(storageUserId),
      ]);
      if (!active) return;
      setDailyPlanGoalState(goal);
      setNotificationsEnabledState(notify);
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
      setNotificationsEnabledState(value);
      await saveNotificationsEnabled(value, storageUserId);
      if (!supabaseConfigured) return { ok: true };
      const result = await pushProfilePatch({ notifications_enabled: value });
      return result ?? { ok: false };
    },
    [storageUserId, supabaseConfigured],
  );

  const applyRemoteNotificationsEnabled = useCallback(
    async (enabled) => {
      const value = Boolean(enabled);
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
