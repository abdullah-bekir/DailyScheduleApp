import { coerceBoolean } from '../lib/taskRemote';
import { getTodayDateKey, isValidDateKey } from './dateKey';

export const TASKS_STORAGE_KEY = '@dailyschedule/tasks_v1';

export function normalizeStoredTasks(data) {
  if (!Array.isArray(data)) return null;
  const out = [];
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
    });
  }
  return out.length ? out : null;
}
