import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AddTaskModal from '../components/tasks/AddTaskModal';
import { getSupabase } from '../lib/supabaseClient';
import { pushProfilePatch } from '../lib/profileRemote';
import { mergeTasksWithRemote, normalizeTaskRecord, sanitizeTask, taskToRemoteRow } from '../lib/taskRemote';
import { completionWeightForPriority, loadCompletionTally, saveCompletionTally } from '../utils/completionTally';
import { getTodayDateKey } from '../utils/dateKey';
import { TASKS_STORAGE_KEY, normalizeStoredTasks } from '../utils/taskStorage';

import { useSupabaseSession } from './SupabaseContext';

const TasksContext = createContext(null);

function newTaskId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function TasksProvider({ children }) {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const [tasks, setTasksState] = useState([]);
  const [tasksHydrated, setTasksHydrated] = useState(false);
  const [tasksDataReady, setTasksDataReady] = useState(false);
  const [completionTally, setCompletionTally] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalDateKey, setAddModalDateKey] = useState(() => getTodayDateKey());
  const tasksRef = useRef([]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const persistTasks = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, []);

  const persistTally = useCallback((n) => {
    setCompletionTally(n);
    saveCompletionTally(n);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      const tally = await loadCompletionTally();
      if (cancelled) return;
      let list = [];
      if (raw) {
        try {
          const parsed = normalizeStoredTasks(JSON.parse(raw));
          list = parsed && parsed.length ? parsed : [];
        } catch {
          list = [];
        }
      }
      setTasksState(list);
      setCompletionTally(tally);
      setTasksHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mergeRemoteRows = useCallback(
    (prev, rows) => {
      const rowList = Array.isArray(rows) ? rows : [];
      const merged = mergeTasksWithRemote(prev, rowList);
      persistTasks(merged);
      return merged;
    },
    [persistTasks],
  );

  const runInitialCloudSync = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !userId) {
      setTasksDataReady(true);
      return;
    }
    const { data, error } = await sb.from('tasks').select('*').eq('user_id', userId);
    if (error) {
      setTasksDataReady(true);
      return;
    }
    setTasksState((prev) => mergeRemoteRows(prev, data ?? []));
    setTasksDataReady(true);
  }, [userId, mergeRemoteRows]);

  useEffect(() => {
    if (!tasksHydrated) return;
    if (!supabaseConfigured) {
      setTasksDataReady(true);
      return;
    }
    if (!authReady) {
      setTasksDataReady(false);
      return;
    }
    if (!userId) {
      setTasksDataReady(true);
      return;
    }
    setTasksDataReady(false);
    runInitialCloudSync();
  }, [tasksHydrated, supabaseConfigured, authReady, userId, runInitialCloudSync]);

  const refreshTasksFromSupabase = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !userId) return;
    const { data, error } = await sb.from('tasks').select('*').eq('user_id', userId);
    if (error || data == null) return;
    setTasksState((prev) => mergeRemoteRows(prev, data));
  }, [userId, mergeRemoteRows]);

  const upsertRemoteTask = useCallback(
    async (task) => {
      const sb = getSupabase();
      if (!sb || !userId) return;
      const row = taskToRemoteRow(task, userId);
      await sb.from('tasks').upsert(row, { onConflict: 'user_id,id' });
    },
    [userId],
  );

  const deleteRemoteTask = useCallback(
    async (taskId) => {
      const sb = getSupabase();
      if (!sb || !userId) return;
      await sb.from('tasks').delete().eq('user_id', userId).eq('id', taskId);
    },
    [userId],
  );

  const openAddTaskModal = useCallback(() => {
    setAddModalDateKey(getTodayDateKey());
    setAddModalVisible(true);
  }, []);

  const openAddTaskModalForDate = useCallback((dateKey) => {
    setAddModalDateKey(dateKey || getTodayDateKey());
    setAddModalVisible(true);
  }, []);

  const onSaveNewTask = useCallback(
    async ({ title, time, priority, dateKey }) => {
      const dk = dateKey && String(dateKey).trim() ? String(dateKey).trim() : getTodayDateKey();
      const record = normalizeTaskRecord({
        id: newTaskId(),
        title: String(title ?? '').trim(),
        time: String(time ?? '').trim(),
        priority,
        dateKey: dk,
        done: false,
        notes: '',
        attachments: [],
      });
      if (!record) return;
      setTasksState((prev) => {
        const next = [...prev, record];
        persistTasks(next);
        return next;
      });
      await upsertRemoteTask(record);
    },
    [persistTasks, upsertRemoteTask],
  );

  const toggleTaskDone = useCallback(
    async (taskId) => {
      const id = String(taskId ?? '').trim();
      if (!id) return;
      let sync = null;
      setTasksState((prev) => {
        const idx = prev.findIndex((t) => String(t.id) === id);
        if (idx < 0) return prev;
        const cur = sanitizeTask(prev[idx]);
        const done = !cur.done;
        const w = completionWeightForPriority(cur.priority);
        let delta = 0;
        if (!cur.done && done) delta = w;
        if (cur.done && !done) delta = -w;
        const nextTask = { ...cur, done };
        sync = { nextTask, delta };
        const next = [...prev];
        next[idx] = nextTask;
        persistTasks(next);
        return next;
      });
      if (!sync?.nextTask) return;
      const { nextTask, delta } = sync;
      if (delta !== 0) {
        setCompletionTally((t) => {
          const n = Math.max(0, t + delta);
          saveCompletionTally(n);
          return n;
        });
      }
      await upsertRemoteTask(nextTask);
    },
    [persistTasks, upsertRemoteTask],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      const id = String(taskId ?? '').trim();
      if (!id) return;
      setTasksState((prev) => {
        const next = prev.filter((t) => String(t.id) !== id);
        persistTasks(next);
        return next;
      });
      await deleteRemoteTask(id);
    },
    [persistTasks, deleteRemoteTask],
  );

  const updateTaskDetails = useCallback(
    async (taskId, patch) => {
      const id = String(taskId ?? '').trim();
      if (!id) return;
      let toSync = null;
      setTasksState((prev) => {
        const idx = prev.findIndex((t) => String(t.id) === id);
        if (idx < 0) return prev;
        const cur = sanitizeTask(prev[idx]);
        const nextRow = { ...cur, ...patch };
        toSync = nextRow;
        const next = [...prev];
        next[idx] = nextRow;
        persistTasks(next);
        return next;
      });
      if (toSync) {
        await upsertRemoteTask(toSync);
      }
    },
    [persistTasks, upsertRemoteTask],
  );

  const applyRemoteCompletionTally = useCallback((raw) => {
    const n = typeof raw === 'number' && !Number.isNaN(raw) ? Math.max(0, Math.floor(raw)) : parseInt(String(raw ?? '0'), 10);
    const v = Number.isNaN(n) || n < 0 ? 0 : n;
    persistTally(v);
  }, [persistTally]);

  const resetAllTaskData = useCallback(async () => {
    const sb = getSupabase();
    if (sb && userId) {
      await sb.from('tasks').delete().eq('user_id', userId);
    }
    setTasksState([]);
    await persistTasks([]);
    persistTally(0);
  }, [userId, persistTasks, persistTally]);

  const grantAdRewardBonus = useCallback((delta) => {
    const d = Math.max(1, Math.min(50, Math.floor(Number(delta)) || 5));
    setCompletionTally((prev) => {
      const next = prev + d;
      saveCompletionTally(next);
      queueMicrotask(() => {
        pushProfilePatch({ completion_tally: next }).catch(() => {});
      });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      tasksHydrated,
      tasksDataReady,
      completionTally,
      refreshTasksFromSupabase,
      openAddTaskModal,
      openAddTaskModalForDate,
      toggleTaskDone,
      deleteTask,
      updateTaskDetails,
      applyRemoteCompletionTally,
      resetAllTaskData,
      grantAdRewardBonus,
    }),
    [
      tasks,
      tasksHydrated,
      tasksDataReady,
      completionTally,
      refreshTasksFromSupabase,
      openAddTaskModal,
      openAddTaskModalForDate,
      toggleTaskDone,
      deleteTask,
      updateTaskDetails,
      applyRemoteCompletionTally,
      resetAllTaskData,
      grantAdRewardBonus,
    ],
  );

  return (
    <TasksContext.Provider value={value}>
      {children}
      <AddTaskModal
        visible={addModalVisible}
        dateKey={addModalDateKey}
        onClose={() => setAddModalVisible(false)}
        onSave={onSaveNewTask}
      />
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return ctx;
}
