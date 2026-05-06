/**
 * Görev state + yerel önbellek + Supabase `public.tasks` senkronu.
 *
 * İşlem ↔ SQL örnekleri (SQL Editor / tablo oluşturulduktan sonra test için):
 *   ../constants/tasksContextOperationsSql.js
 *   • addTask           → TASKS_CONTEXT_INSERT_SQL
 *   • toggleTaskDone    → TASKS_CONTEXT_UPDATE_DONE_SQL
 *   • deleteTask        → TASKS_CONTEXT_DELETE_SQL
 *   • ilk çekme/yenileme → TASKS_CONTEXT_SELECT_SQL  (refreshTasksFromSupabase, hydrate)
 *
 * Geniş CRUD + şema özeti: tasksSchemaSql.js (TASKS_CRUD_SQL, TASKS_DDL_SQL).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import AddTaskModal from '../components/tasks/AddTaskModal';
import { pushProfilePatch } from '../lib/profileRemote';
import { getSupabase } from '../lib/supabaseClient';
import {
  applyRemoteTaskRowsToState,
  coerceBoolean,
  normalizeTaskRecord,
  taskToRemoteRow,
} from '../lib/taskRemote';
import {
  completionWeightForPriority,
  loadCompletionTally,
  saveCompletionTally,
} from '../utils/completionTally';
import { getTodayDateKey, isValidDateKey } from '../utils/dateKey';
import { normalizeStoredTasks, TASKS_STORAGE_KEY } from '../utils/taskStorage';
import { useSupabaseSession } from './SupabaseContext';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { authReady, userId, supabaseConfigured } = useSupabaseSession();
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const [tasks, setTasks] = useState(() => []);
  const [hydrated, setHydrated] = useState(false);
  const [tasksRemoteReady, setTasksRemoteReady] = useState(false);
  const [completionTally, setCompletionTally] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modalDateKey, setModalDateKey] = useState(() => getTodayDateKey());
  const didSyncForUserRef = useRef(null);

  const applyRemoteCompletionTally = useCallback((remote) => {
    const n = typeof remote === 'number' ? remote : parseInt(remote, 10);
    if (Number.isNaN(n) || n < 0) return;
    setCompletionTally((c) => Math.max(c, n));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [tasksRaw, tally] = await Promise.all([
          AsyncStorage.getItem(TASKS_STORAGE_KEY),
          loadCompletionTally(),
        ]);
        if (!cancelled) {
          setCompletionTally(tally);
          if (tasksRaw) {
            const parsed = JSON.parse(tasksRaw);
            const normalized = normalizeStoredTasks(parsed);
            if (normalized) setTasks(normalized);
          }
        }
      } catch {
        /* ignore corrupt storage */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      didSyncForUserRef.current = null;
    }
  }, [userId]);

  useEffect(() => {
    if (!hydrated) return;

    if (!supabaseConfigured) {
      setTasksRemoteReady(true);
      return;
    }

    if (!authReady) return;

    if (!userId) {
      setTasksRemoteReady(true);
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      setTasksRemoteReady(true);
      return;
    }

    if (didSyncForUserRef.current === userId) {
      setTasksRemoteReady(true);
      return;
    }

    didSyncForUserRef.current = userId;

    let cancelled = false;
    setTasksRemoteReady(false);

    (async () => {
      try {
        const { data: rows, error } = await sb.from('tasks').select('*').eq('user_id', userId);
        if (!cancelled) {
          if (error) {
            setTasks([]);
            return;
          }
          if (Array.isArray(rows) && rows.length === 0) {
            setTasks([]);
            return;
          }
          applyRemoteTaskRowsToState(sb, userId, setTasks, rows);
        }
      } finally {
        if (!cancelled) setTasksRemoteReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, authReady, userId, supabaseConfigured]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = tasks.map(normalizeTaskRecord).filter((t) => t != null);
    AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveCompletionTally(completionTally);
  }, [completionTally, hydrated]);

  useEffect(() => {
    if (!hydrated || !authReady || !userId || !supabaseConfigured) return;
    const t = setTimeout(() => {
      pushProfilePatch({ completion_tally: completionTally });
    }, 800);
    return () => clearTimeout(t);
  }, [completionTally, hydrated, authReady, userId, supabaseConfigured]);

  const addTask = useCallback(({ title, time, priority, dateKey }) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const dk = isValidDateKey(dateKey) ? dateKey : getTodayDateKey();
    const newTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: trimmed,
      time,
      done: false,
      priority,
      dateKey: dk,
      notes: '',
      attachments: [],
    };
    setTasks((prev) => [...prev, newTask]);
    const sb = getSupabase();
    const uid = userIdRef.current;
    if (sb && uid && supabaseConfigured) {
      sb.from('tasks').insert(taskToRemoteRow(newTask, uid)).then(() => {}, () => {});
    }
  }, [supabaseConfigured]);

  const toggleTaskDone = useCallback((id) => {
    const idStr = String(id);
    let delta = 0;
    let updatedTask = null;
    setTasks((prev) => {
      const target = prev.find((t) => String(t.id) === idStr);
      if (target && !coerceBoolean(target.done, false)) {
        delta = completionWeightForPriority(target.priority);
      }
      const mapped = prev.map((t) => {
        if (String(t.id) !== idStr) return t;
        const done = coerceBoolean(t.done, false);
        return { ...t, done: !done };
      });
      updatedTask = mapped.find((t) => String(t.id) === idStr);
      return mapped;
    });
    if (delta > 0) {
      setCompletionTally((c) => c + delta);
    }
    const sb = getSupabase();
    const uid = userIdRef.current;
    if (sb && uid && supabaseConfigured && updatedTask) {
      sb.from('tasks')
        .update({ done: updatedTask.done })
        .eq('id', idStr)
        .eq('user_id', uid)
        .then(() => {}, () => {});
    }
  }, [supabaseConfigured]);

  const deleteTask = useCallback((id) => {
    const idStr = String(id);
    setTasks((prev) => prev.filter((t) => String(t.id) !== idStr));
    const sb = getSupabase();
    const uid = userIdRef.current;
    if (sb && uid && supabaseConfigured) {
      sb.from('tasks').delete().eq('id', idStr).eq('user_id', uid).then(() => {}, () => {});
    }
  }, [supabaseConfigured]);

  const updateTaskDetails = useCallback(
    (id, patch) => {
      const idStr = String(id);
      let remoteNotes = null;
      let remoteAttachments = null;
      setTasks((prev) =>
        prev.map((t) => {
          if (String(t.id) !== idStr) return t;
          const nextNotes =
            patch?.notes !== undefined ? String(patch.notes ?? '') : String(t.notes ?? '');
          const nextAttachments =
            patch?.attachments !== undefined
              ? (Array.isArray(patch.attachments) ? patch.attachments : [])
                  .map((x) => String(x ?? '').trim())
                  .filter((x) => x.length > 0)
              : Array.isArray(t.attachments)
                ? t.attachments
                : [];
          remoteNotes = nextNotes;
          remoteAttachments = nextAttachments;
          return {
            ...t,
            notes: nextNotes,
            attachments: nextAttachments,
          };
        }),
      );
      const sb = getSupabase();
      const uid = userIdRef.current;
      if (sb && uid && supabaseConfigured && remoteAttachments !== null) {
        sb.from('tasks')
          .update({ notes: remoteNotes ?? '', attachments: remoteAttachments })
          .eq('id', idStr)
          .eq('user_id', uid)
          .then(() => {}, () => {});
      }
    },
    [supabaseConfigured],
  );

  const resetAllTaskData = useCallback(async () => {
    setTasks([]);
    setCompletionTally(0);
    didSyncForUserRef.current = null;
    try {
      await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    saveCompletionTally(0);

    const sb = getSupabase();
    const uid = userIdRef.current;
    if (sb && uid && supabaseConfigured) {
      sb.from('tasks').delete().eq('user_id', uid).then(() => {}, () => {});
    }
  }, [supabaseConfigured]);

  const openAddTaskModal = useCallback(() => {
    setModalDateKey(getTodayDateKey());
    setAddModalVisible(true);
  }, []);

  const openAddTaskModalForDate = useCallback((dateKey) => {
    setModalDateKey(isValidDateKey(dateKey) ? dateKey : getTodayDateKey());
    setAddModalVisible(true);
  }, []);

  const closeAddTaskModal = useCallback(() => setAddModalVisible(false), []);

  const refreshTasksFromSupabase = useCallback(async () => {
    if (!hydrated || !authReady || !userId || !supabaseConfigured) return;
    const sb = getSupabase();
    if (!sb) return;
    try {
      const { data: rows, error } = await sb.from('tasks').select('*').eq('user_id', userId);
      if (error) {
        setTasks([]);
        return;
      }
      if (Array.isArray(rows) && rows.length === 0) {
        setTasks([]);
        return;
      }
      applyRemoteTaskRowsToState(sb, userId, setTasks, rows);
    } catch {
      setTasks([]);
    }
  }, [hydrated, authReady, userId, supabaseConfigured]);

  useEffect(() => {
    if (!hydrated || !authReady || !userId || !supabaseConfigured) return undefined;
    const sb = getSupabase();
    if (!sb) return undefined;

    let channel = null;
    try {
      channel = sb
        .channel(`tasks-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            refreshTasksFromSupabase();
          },
        )
        .subscribe((status, err) => {
          if (status !== 'SUBSCRIBED' && __DEV__) {
            console.warn('[tasks realtime]', status, err?.message ?? '');
          }
        });
    } catch (e) {
      if (__DEV__) console.warn('[tasks realtime] subscribe failed', e?.message ?? e);
    }

    return () => {
      if (!channel) return;
      try {
        sb.removeChannel(channel);
      } catch {
        /* ignore */
      }
    };
  }, [hydrated, authReady, userId, supabaseConfigured, refreshTasksFromSupabase]);

  const tasksDataReady = hydrated && tasksRemoteReady;

  const tasksForUi = useMemo(
    () => tasks.map(normalizeTaskRecord).filter((t) => t != null),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks: tasksForUi,
      completionTally,
      tasksHydrated: hydrated,
      tasksRemoteReady,
      tasksDataReady,
      applyRemoteCompletionTally,
      refreshTasksFromSupabase,
      addTask,
      toggleTaskDone,
      deleteTask,
      updateTaskDetails,
      resetAllTaskData,
      openAddTaskModal,
      openAddTaskModalForDate,
      closeAddTaskModal,
    }),
    [
      tasksForUi,
      completionTally,
      hydrated,
      tasksRemoteReady,
      tasksDataReady,
      applyRemoteCompletionTally,
      refreshTasksFromSupabase,
      addTask,
      toggleTaskDone,
      deleteTask,
      updateTaskDetails,
      resetAllTaskData,
      openAddTaskModal,
      openAddTaskModalForDate,
      closeAddTaskModal,
    ],
  );

  return (
    <TasksContext.Provider value={value}>
      {children}
      <AddTaskModal
        visible={addModalVisible}
        dateKey={modalDateKey}
        onClose={closeAddTaskModal}
        onSave={addTask}
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
