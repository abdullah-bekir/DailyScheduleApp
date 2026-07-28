import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AddTaskModal from '../components/tasks/AddTaskModal';
import i18n from '../i18n';
import { getSupabase } from '../lib/supabaseClient';
import { pushProfilePatch } from '../lib/profileRemote';
import { mergeTasksWithRemote, normalizeTaskRecord, sanitizeTask, taskToRemoteRow } from '../lib/taskRemote';
import { completionWeightForPriority, loadCompletionTally, saveCompletionTally } from '../utils/completionTally';
import { getTodayDateKey } from '../utils/dateKey';
import {
  enqueueTaskOutboxOperation,
  loadStoredTasks,
  loadTaskOutbox,
  normalizeStoredTasks,
  saveStoredTasks,
  saveTaskOutbox,
} from '../utils/taskStorage';

import { useSupabaseSession } from './SupabaseContext';

const TasksContext = createContext(null);

function newTaskId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function withUpdatedAt(task) {
  return { ...task, updatedAt: new Date().toISOString() };
}

export function TasksProvider({ children }) {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const [tasks, setTasksState] = useState([]);
  const [tasksHydrated, setTasksHydrated] = useState(false);
  const [tasksDataReady, setTasksDataReady] = useState(false);
  const [tasksSyncError, setTasksSyncError] = useState(null);
  const [completionTally, setCompletionTally] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addModalDateKey, setAddModalDateKey] = useState(() => getTodayDateKey());
  const tasksRef = useRef([]);
  const userIdRef = useRef(userId);
  const sessionVersionRef = useRef(0);
  const storageLoadRef = useRef(0);
  const cloudSyncRef = useRef(0);
  const outboxDrainRef = useRef(false);
  const storageUserId = supabaseConfigured ? userId : null;
  const tasksMutationReady = tasksHydrated && (!supabaseConfigured || authReady);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    userIdRef.current = userId;
    sessionVersionRef.current += 1;
    cloudSyncRef.current += 1;
  }, [userId]);

  const persistTasks = useCallback(async (list) => {
    await saveStoredTasks(storageUserId, list);
  }, [storageUserId]);

  const persistTally = useCallback((n) => {
    setCompletionTally(n);
    saveCompletionTally(n, storageUserId);
  }, [storageUserId]);

  const syncProfilePatch = useCallback(async (patch) => {
    const ownerId = userIdRef.current;
    const sessionVersion = sessionVersionRef.current;
    const result = await pushProfilePatch(patch);
    if (userIdRef.current !== ownerId || sessionVersionRef.current !== sessionVersion) return false;
    if (!result?.ok) {
      setTasksSyncError(result?.error || i18n.t('settings.syncError'));
      return false;
    }
    return true;
  }, []);

  const queueTaskOperation = useCallback(
    async (operation) => {
      if (!supabaseConfigured || !userId) return [];
      return enqueueTaskOutboxOperation(userId, operation);
    },
    [supabaseConfigured, userId],
  );

  const reportTasksSyncError = useCallback((message) => {
    setTasksSyncError(message || i18n.t('settings.syncError'));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadId = ++storageLoadRef.current;
    (async () => {
      setTasksHydrated(false);
      setTasksDataReady(false);
      setTasksSyncError(null);
      setTasksState([]);
      setCompletionTally(0);

      if (supabaseConfigured && !authReady) return;
      if (supabaseConfigured && !userId) {
        if (!cancelled && loadId === storageLoadRef.current) {
          setTasksHydrated(true);
          setTasksDataReady(true);
        }
        return;
      }

      const [raw, tally] = await Promise.all([loadStoredTasks(storageUserId), loadCompletionTally(storageUserId)]);
      if (cancelled || loadId !== storageLoadRef.current) return;
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
  }, [supabaseConfigured, authReady, userId, storageUserId]);

  const mergeRemoteRows = useCallback(
    (prev, rows) => {
      const rowList = Array.isArray(rows) ? rows : [];
      const merged = mergeTasksWithRemote(prev, rowList);
      persistTasks(merged);
      return merged;
    },
    [persistTasks],
  );

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
  }, [tasksHydrated, supabaseConfigured, authReady, userId]);

  const upsertRemoteTask = useCallback(
    async (task, ownerId = userId) => {
      const sb = getSupabase();
      const sessionVersion = sessionVersionRef.current;
      if (!sb || !ownerId || userIdRef.current !== ownerId) return false;
      const row = taskToRemoteRow(task, ownerId);
      const { error } = await sb.from('tasks').upsert(row, { onConflict: 'user_id,id' });
      if (userIdRef.current !== ownerId || sessionVersionRef.current !== sessionVersion) return false;
      if (error) {
        if (userIdRef.current === ownerId) {
          setTasksSyncError(error.message || i18n.t('settings.syncError'));
        }
        return false;
      }
      return true;
    },
    [userId],
  );

  const drainTaskOutbox = useCallback(
    async (ownerId = userId) => {
      const sb = getSupabase();
      const sessionVersion = sessionVersionRef.current;
      if (!sb || !ownerId || outboxDrainRef.current || userIdRef.current !== ownerId) return true;

      outboxDrainRef.current = true;
      try {
        const operations = await loadTaskOutbox(ownerId);
        let remaining = operations;
        for (let index = 0; index < operations.length; index += 1) {
          if (userIdRef.current !== ownerId || sessionVersionRef.current !== sessionVersion) return false;
          const operation = operations[index];
          const request =
            operation.type === 'delete'
              ? sb.from('tasks').delete().eq('user_id', ownerId).eq('id', operation.taskId)
              : sb.from('tasks').upsert(taskToRemoteRow(operation.task, ownerId), { onConflict: 'user_id,id' });
          const { error } = await request;
          if (userIdRef.current !== ownerId || sessionVersionRef.current !== sessionVersion) return false;
          if (error) {
            setTasksSyncError(error.message || i18n.t('settings.syncError'));
            await saveTaskOutbox(ownerId, remaining);
            return false;
          }
          remaining = operations.slice(index + 1);
          await saveTaskOutbox(ownerId, remaining);
        }
        return true;
      } finally {
        outboxDrainRef.current = false;
      }
    },
    [userId],
  );

  const runInitialCloudSync = useCallback(async () => {
    const sb = getSupabase();
    const ownerId = userId;
    const syncId = ++cloudSyncRef.current;
    const sessionVersion = sessionVersionRef.current;
    const isCurrentSync = () =>
      userIdRef.current === ownerId && sessionVersionRef.current === sessionVersion && cloudSyncRef.current === syncId;
    if (!sb || !ownerId) {
      setTasksSyncError(null);
      setTasksDataReady(true);
      return true;
    }
    setTasksSyncError(null);
    const { data, error } = await sb.from('tasks').select('*').eq('user_id', ownerId);
    if (!isCurrentSync()) return false;
    if (error) {
      setTasksSyncError(error.message || i18n.t('settings.syncError'));
      setTasksDataReady(true);
      return false;
    }
    const pendingOperations = await loadTaskOutbox(ownerId);
    if (!isCurrentSync()) return false;
    const pendingDeleteIds = new Set(
      pendingOperations.filter((operation) => operation.type === 'delete').map((operation) => operation.taskId),
    );
    const remoteRows = (data ?? []).filter((row) => !pendingDeleteIds.has(String(row.id)));
    const remoteById = new Map(remoteRows.map((row) => [String(row.id), row]));
    setTasksState((prev) => mergeRemoteRows(prev, remoteRows));
    const localChanges = tasksRef.current.filter((task) => {
      if (!task?.id) return false;
      const remote = remoteById.get(String(task.id));
      if (!remote) return true;
      const localUpdatedAt = Date.parse(task.updatedAt || '');
      const remoteUpdatedAt = Date.parse(remote.updated_at || '');
      return Number.isFinite(localUpdatedAt) && (!Number.isFinite(remoteUpdatedAt) || localUpdatedAt >= remoteUpdatedAt);
    });
    if (localChanges.length > 0) {
      const results = await Promise.all(localChanges.map((task) => upsertRemoteTask(task, ownerId)));
      if (!isCurrentSync()) return false;
      if (results.some((ok) => !ok)) {
        setTasksDataReady(true);
        return false;
      }
    }
    if (!(await drainTaskOutbox(ownerId))) {
      if (!isCurrentSync()) return false;
      setTasksDataReady(true);
      return false;
    }
    setTasksDataReady(true);
    return true;
  }, [userId, mergeRemoteRows, upsertRemoteTask, drainTaskOutbox]);

  useEffect(() => {
    if (!tasksHydrated || !supabaseConfigured || !authReady || !userId) return;
    runInitialCloudSync();
  }, [tasksHydrated, supabaseConfigured, authReady, userId, runInitialCloudSync]);

  const refreshTasksFromSupabase = useCallback(async () => {
    const sb = getSupabase();
    const ownerId = userId;
    const syncId = ++cloudSyncRef.current;
    const sessionVersion = sessionVersionRef.current;
    if (!sb || !ownerId) return false;
    const outboxSynced = await drainTaskOutbox(ownerId);
    if (
      userIdRef.current !== ownerId ||
      sessionVersionRef.current !== sessionVersion ||
      cloudSyncRef.current !== syncId
    ) {
      return false;
    }
    const { data, error } = await sb.from('tasks').select('*').eq('user_id', ownerId);
    if (
      userIdRef.current !== ownerId ||
      sessionVersionRef.current !== sessionVersion ||
      cloudSyncRef.current !== syncId
    ) {
      return false;
    }
    if (error) {
      setTasksSyncError(error.message || i18n.t('settings.syncError'));
      return false;
    }
    if (data == null) return false;
    const pendingOperations = await loadTaskOutbox(ownerId);
    const pendingDeleteIds = new Set(
      pendingOperations.filter((operation) => operation.type === 'delete').map((operation) => operation.taskId),
    );
    if (outboxSynced) setTasksSyncError(null);
    setTasksState((prev) => mergeRemoteRows(prev, data.filter((row) => !pendingDeleteIds.has(String(row.id)))));
    return true;
  }, [userId, mergeRemoteRows, drainTaskOutbox]);

  const retryCloudSync = useCallback(async () => {
    if (!supabaseConfigured || !authReady || !userId) return false;
    setTasksDataReady(false);
    setTasksSyncError(null);
    return runInitialCloudSync();
  }, [supabaseConfigured, authReady, userId, runInitialCloudSync]);

  const deleteRemoteTask = useCallback(
    async (taskId, ownerId = userId) => {
      const sb = getSupabase();
      const sessionVersion = sessionVersionRef.current;
      if (!sb || !ownerId || userIdRef.current !== ownerId) return false;
      const { error } = await sb.from('tasks').delete().eq('user_id', ownerId).eq('id', taskId);
      if (userIdRef.current !== ownerId || sessionVersionRef.current !== sessionVersion) return false;
      if (error) {
        if (userIdRef.current === ownerId) {
          setTasksSyncError(error.message || i18n.t('settings.syncError'));
        }
        return false;
      }
      return true;
    },
    [userId],
  );

  const openAddTaskModal = useCallback(() => {
    if (!tasksMutationReady) return false;
    setAddModalDateKey(getTodayDateKey());
    setAddModalVisible(true);
    return true;
  }, [tasksMutationReady]);

  const openAddTaskModalForDate = useCallback((dateKey) => {
    if (!tasksMutationReady) return false;
    setAddModalDateKey(dateKey || getTodayDateKey());
    setAddModalVisible(true);
    return true;
  }, [tasksMutationReady]);

  const onSaveNewTask = useCallback(
    async ({ title, time, priority, dateKey }) => {
      if (!tasksMutationReady) return false;
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
      if (!record) return false;
      setTasksState((prev) => {
        const next = [...prev, record];
        persistTasks(next);
        return next;
      });
      if (!(await upsertRemoteTask(record))) {
        await queueTaskOperation({ type: 'upsert', taskId: record.id, task: record });
      }
      return true;
    },
    [tasksMutationReady, persistTasks, upsertRemoteTask, queueTaskOperation],
  );

  const toggleTaskDone = useCallback(
    async (taskId) => {
      if (!tasksMutationReady) return false;
      const id = String(taskId ?? '').trim();
      if (!id) return false;
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
        const nextTask = withUpdatedAt({ ...cur, done });
        sync = { nextTask, delta };
        const next = [...prev];
        next[idx] = nextTask;
        persistTasks(next);
        return next;
      });
      if (!sync?.nextTask) return false;
      const { nextTask, delta } = sync;
      if (delta !== 0) {
        setCompletionTally((t) => {
          const n = Math.max(0, t + delta);
          saveCompletionTally(n, storageUserId);
          queueMicrotask(() => {
            syncProfilePatch({ completion_tally: n });
          });
          return n;
        });
      }
      if (!(await upsertRemoteTask(nextTask))) {
        await queueTaskOperation({ type: 'upsert', taskId: nextTask.id, task: nextTask });
      }
      return true;
    },
    [tasksMutationReady, persistTasks, upsertRemoteTask, storageUserId, syncProfilePatch, queueTaskOperation],
  );

  const deleteTask = useCallback(
    async (taskId) => {
      if (!tasksMutationReady) return false;
      const id = String(taskId ?? '').trim();
      if (!id) return false;
      let tallyDelta = 0;
      setTasksState((prev) => {
        const idx = prev.findIndex((t) => String(t.id) === id);
        if (idx < 0) return prev;
        const cur = sanitizeTask(prev[idx]);
        if (cur.done) {
          tallyDelta = -completionWeightForPriority(cur.priority);
        }
        const next = prev.filter((t) => String(t.id) !== id);
        persistTasks(next);
        return next;
      });
      if (tallyDelta !== 0) {
        setCompletionTally((t) => {
          const n = Math.max(0, t + tallyDelta);
          saveCompletionTally(n, storageUserId);
          queueMicrotask(() => {
            syncProfilePatch({ completion_tally: n });
          });
          return n;
        });
      }
      if (!(await deleteRemoteTask(id))) {
        await queueTaskOperation({ type: 'delete', taskId: id });
      }
      return true;
    },
    [
      tasksMutationReady,
      persistTasks,
      deleteRemoteTask,
      queueTaskOperation,
      storageUserId,
      syncProfilePatch,
    ],
  );

  const updateTaskDetails = useCallback(
    async (taskId, patch) => {
      if (!tasksMutationReady) return false;
      const id = String(taskId ?? '').trim();
      if (!id) return false;
      let toSync = null;
      setTasksState((prev) => {
        const idx = prev.findIndex((t) => String(t.id) === id);
        if (idx < 0) return prev;
        const cur = sanitizeTask(prev[idx]);
        const nextRow = withUpdatedAt({ ...cur, ...patch });
        toSync = nextRow;
        const next = [...prev];
        next[idx] = nextRow;
        persistTasks(next);
        return next;
      });
      if (toSync) {
        if (!(await upsertRemoteTask(toSync))) {
          await queueTaskOperation({ type: 'upsert', taskId: toSync.id, task: toSync });
        }
      }
      return Boolean(toSync);
    },
    [tasksMutationReady, persistTasks, upsertRemoteTask, queueTaskOperation],
  );

  const applyRemoteCompletionTally = useCallback((raw) => {
    const n = typeof raw === 'number' && !Number.isNaN(raw) ? Math.max(0, Math.floor(raw)) : parseInt(String(raw ?? '0'), 10);
    const v = Number.isNaN(n) || n < 0 ? 0 : n;
    persistTally(v);
  }, [persistTally]);

  const resetAllTaskData = useCallback(async () => {
    const sb = getSupabase();
    if (sb && userId) {
      const { error } = await sb.from('tasks').delete().eq('user_id', userId);
      if (error) {
        setTasksSyncError(error.message || i18n.t('settings.syncError'));
        return false;
      }
      if (!(await syncProfilePatch({ completion_tally: 0 }))) return false;
    }
    setTasksState([]);
    await persistTasks([]);
    persistTally(0);
    setTasksSyncError(null);
    return true;
  }, [userId, persistTasks, persistTally, syncProfilePatch]);

  const grantAdRewardBonus = useCallback((delta) => {
    const d = Math.max(1, Math.min(50, Math.floor(Number(delta)) || 5));
    setCompletionTally((prev) => {
      const next = prev + d;
      saveCompletionTally(next, storageUserId);
      queueMicrotask(() => {
        syncProfilePatch({ completion_tally: next });
      });
      return next;
    });
  }, [storageUserId, syncProfilePatch]);

  const value = useMemo(
    () => ({
      tasks,
      tasksHydrated,
      tasksDataReady,
      tasksMutationReady,
      tasksSyncError,
      completionTally,
      refreshTasksFromSupabase,
      retryCloudSync,
      openAddTaskModal,
      openAddTaskModalForDate,
      toggleTaskDone,
      deleteTask,
      updateTaskDetails,
      applyRemoteCompletionTally,
      resetAllTaskData,
      grantAdRewardBonus,
      reportTasksSyncError,
    }),
    [
      tasks,
      tasksHydrated,
      tasksDataReady,
      tasksMutationReady,
      tasksSyncError,
      completionTally,
      refreshTasksFromSupabase,
      retryCloudSync,
      openAddTaskModal,
      openAddTaskModalForDate,
      toggleTaskDone,
      deleteTask,
      updateTaskDetails,
      applyRemoteCompletionTally,
      resetAllTaskData,
      grantAdRewardBonus,
      reportTasksSyncError,
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
