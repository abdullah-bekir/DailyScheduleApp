import { getTodayDateKey, isValidDateKey } from '../utils/dateKey';

/** Postgres / JSON bazen boolean yerine string döndürür; RN native köprüsü boolean ister */
export function coerceBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (['true', 't', '1', 'yes'].includes(s)) return true;
    if (['false', 'f', '0', 'no'].includes(s)) return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

export function mapRowToTask(row) {
  const dk =
    typeof row.date_key === 'string'
      ? row.date_key
      : row.date_key instanceof Date
        ? row.date_key.toISOString().slice(0, 10)
        : String(row.date_key);
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    time: String(row.time ?? ''),
    done: coerceBoolean(row.done, false),
    priority: ['high', 'medium', 'low'].includes(row.priority) ? row.priority : 'medium',
    dateKey: dk,
    notes: String(row.notes ?? ''),
    attachments: Array.isArray(row.attachments)
      ? row.attachments
          .map((x) => String(x ?? '').trim())
          .filter((x) => x.length > 0)
      : [],
  };
}

export function taskToRemoteRow(task, userId) {
  const attachments = Array.isArray(task.attachments)
    ? task.attachments.map((x) => String(x ?? '').trim()).filter((x) => x.length > 0)
    : [];
  return {
    user_id: userId,
    id: task.id,
    title: task.title,
    time: task.time,
    date_key: task.dateKey,
    done: coerceBoolean(task.done, false),
    priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
    notes: String(task.notes ?? ''),
    attachments,
  };
}

/**
 * Aynı id hem yerelde hem sunucuda varsa sunucu satırı kullanılır (updated_at güvenilirliği).
 */
/** Yerel listeden gelen görevde done/priority sapmasını düzeltir */
export function sanitizeTask(task) {
  if (!task) return task;
  return {
    ...task,
    done: coerceBoolean(task.done, false),
    priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
  };
}

/**
 * Liste / UI için tek tip görev: id, done, dateKey ve metin alanlarını güvenli şekilde düzeltir.
 * Geçersiz kayıtlar null döner (filtrelenir).
 */
export function normalizeTaskRecord(task) {
  if (!task || typeof task !== 'object') return null;
  const id = task.id != null ? String(task.id).trim() : '';
  if (!id) return null;
  const title = String(task.title ?? '').trim();
  if (!title) return null;
  const time = String(task.time ?? '').trim();
  if (!/^\d{1,2}:\d{2}$/.test(time)) return null;

  const dkRaw = task.dateKey ?? task.date_key;
  let dateKey = '';
  if (typeof dkRaw === 'string' && isValidDateKey(dkRaw)) dateKey = dkRaw;
  else if (dkRaw instanceof Date) dateKey = getTodayDateKey(dkRaw);
  if (!dateKey) return null;

  return {
    id,
    title,
    time,
    done: coerceBoolean(task.done, false),
    priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
    dateKey,
    notes: String(task.notes ?? ''),
    attachments: Array.isArray(task.attachments)
      ? task.attachments
          .map((x) => String(x ?? '').trim())
          .filter((x) => x.length > 0)
      : [],
  };
}

export function mergeTasksWithRemote(localTasks, remoteRows) {
  const remote = (remoteRows || []).map(mapRowToTask);
  const rMap = new Map(remote.map((t) => [String(t.id), t]));
  const lMap = new Map(
    (localTasks || [])
      .filter((t) => t != null && t.id != null && String(t.id).trim() !== '')
      .map((t) => [String(t.id), t]),
  );
  const ids = new Set([...rMap.keys(), ...lMap.keys()]);
  const merged = [];
  for (const id of ids) {
    const r = rMap.get(id);
    const l = lMap.get(id);
    if (r && l) {
      /** Uzak satır not/ek dosya taşımıyorsa yereldekini koru */
      merged.push({
        ...r,
        notes: String(l.notes ?? r.notes ?? ''),
        attachments: Array.isArray(l.attachments)
          ? l.attachments
              .map((x) => String(x ?? '').trim())
              .filter((x) => x.length > 0)
          : Array.isArray(r.attachments)
            ? r.attachments
            : [],
      });
    }
    else merged.push(r || sanitizeTask(l));
  }
  return merged;
}

/**
 * Supabase'ten gelen satırları yerel liste ile birleştirir; uzak boş ama yerel doluysa upsert dener.
 */
export function applyRemoteTaskRowsToState(sb, userId, setTasks, rows) {
  /** Sunucu yanıtı yoksa (data undefined) state'i dokunma — yanlışlıkla tam upsert tetiklenmesin */
  if (rows == null) return;
  const rowList = Array.isArray(rows) ? rows : [];
  setTasks((prev) => {
    /** Bulut kaynak kabul edilir: uzak boşsa yerel de boşaltılır (hayalet kayıtları önler). */
    if (!rowList.length) return [];
    if (rowList.length) return mergeTasksWithRemote(prev, rowList);
    return prev;
  });
}
