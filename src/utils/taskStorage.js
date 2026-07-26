import AsyncStorage from '@react-native-async-storage/async-storage';

import { coerceBoolean } from '../lib/taskRemote';
import { getTodayDateKey, isValidDateKey } from './dateKey';

export const TASKS_STORAGE_KEY = '@dailyschedule/tasks_v1';
const TASKS_STORAGE_MIGRATION_KEY = '@dailyschedule/tasks_v1_migrated_user';
const TASK_OUTBOX_STORAGE_KEY = '@dailyschedule/task_outbox_v1';

function userScopedTasksKey(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  return id ? `${TASKS_STORAGE_KEY}:${id}` : TASKS_STORAGE_KEY;
}

async function migrateLegacyTasksForUser(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  if (!id) return;

  const targetKey = userScopedTasksKey(id);
  const [migrationOwner, target, legacy] = await Promise.all([
    AsyncStorage.getItem(TASKS_STORAGE_MIGRATION_KEY),
    AsyncStorage.getItem(targetKey),
    AsyncStorage.getItem(TASKS_STORAGE_KEY),
  ]);

  if (!migrationOwner && target == null && legacy != null) {
    await AsyncStorage.setItem(targetKey, legacy);
  }
  if (!migrationOwner) {
    await AsyncStorage.setItem(TASKS_STORAGE_MIGRATION_KEY, id);
  }
}

export async function loadStoredTasks(userId) {
  try {
    await migrateLegacyTasksForUser(userId);
    return await AsyncStorage.getItem(userScopedTasksKey(userId));
  } catch {
    return null;
  }
}

export async function saveStoredTasks(userId, tasks) {
  try {
    await AsyncStorage.setItem(userScopedTasksKey(userId), JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

function taskOutboxKey(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  return id ? `${TASK_OUTBOX_STORAGE_KEY}:${id}` : TASK_OUTBOX_STORAGE_KEY;
}

function normalizeOutboxOperation(operation) {
  const type = operation?.type;
  const taskId = String(operation?.taskId ?? operation?.task?.id ?? '').trim();
  if (!taskId || !['upsert', 'delete'].includes(type)) return null;
  if (type === 'delete') return { type, taskId };
  const task = normalizeStoredTasks([operation.task])?.[0];
  return task ? { type, taskId, task } : null;
}

export async function loadTaskOutbox(userId) {
  try {
    const raw = await AsyncStorage.getItem(taskOutboxKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeOutboxOperation).filter(Boolean);
  } catch {
    return [];
  }
}

export async function saveTaskOutbox(userId, operations) {
  try {
    const safe = Array.isArray(operations) ? operations.map(normalizeOutboxOperation).filter(Boolean) : [];
    await AsyncStorage.setItem(taskOutboxKey(userId), JSON.stringify(safe));
  } catch {
    /* keep local task data usable when the outbox cannot be persisted */
  }
}

export async function enqueueTaskOutboxOperation(userId, operation) {
  const nextOperation = normalizeOutboxOperation(operation);
  if (!nextOperation) return [];
  const current = await loadTaskOutbox(userId);
  const withoutSameTask = current.filter((item) => item.taskId !== nextOperation.taskId);
  const next = [...withoutSameTask, nextOperation];
  await saveTaskOutbox(userId, next);
  return next;
}

export function normalizeStoredTasks(data) {
  if (!Array.isArray(data)) return null;
  const out = [];
  const migratedUpdatedAt = new Date().toISOString();
  for (const t of data) {
    if (
      !t ||
      typeof t.id !== 'string' ||
      typeof t.title !== 'string' ||
      typeof t.time !== 'string' ||
      !['high', 'medium', 'low'].includes(t.priority)
    ) {
      continue;
    }
    const dateKey = isValidDateKey(t.dateKey) ? t.dateKey : getTodayDateKey();
    out.push({
      id: t.id,
      title: t.title,
      time: t.time,
      done: coerceBoolean(t.done, false),
      priority: t.priority,
      dateKey,
      notes: typeof t.notes === 'string' ? t.notes : '',
      attachments: Array.isArray(t.attachments)
        ? t.attachments
            .map((x) => String(x ?? '').trim())
            .filter((x) => x.length > 0)
        : [],
      updatedAt:
        typeof t.updatedAt === 'string' && Number.isFinite(Date.parse(t.updatedAt)) ? t.updatedAt : migratedUpdatedAt,
    });
  }
  return out.length ? out : null;
}
