import { getTodayDateKey, getWeekDaysContaining } from './dateKey';

function sanitizeTasksForStats(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => {
    if (!t || typeof t !== 'object') return false;
    const id = String(t.id ?? '').trim();
    const title = String(t.title ?? '').trim();
    const dateKey = String(t.dateKey ?? '');
    return id.length > 0 && title.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
  });
}

/** Bugünden geriye doğru n günün dateKey listesi (eskiden yeniye) */
export function getRollingDayKeys(n, refDate = new Date()) {
  const keys = [];
  const d = new Date(refDate);
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    keys.push(getTodayDateKey(x));
  }
  return keys;
}

function addDays(date, n) {
  const x = new Date(date);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() + n);
  return x;
}

/** Pazartesi başlangıçlı hafta (yerel tarih) */
function mondayOfWeekContaining(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Grafik noktası (gün / hafta / ay ortak şekli)
 * @typedef {{ periodKey: string, labelPrimary: string, labelSecondary: string, doneCount: number, totalCount: number }} ChartPoint
 */

/** Son `nDays` gün (eskiden yeniye) */
export function buildDailySeries(tasks, nDays = 7, locale) {
  const safeTasks = sanitizeTasksForStats(tasks);
  const keys = getRollingDayKeys(nDays);
  const highlightKey = getTodayDateKey();
  const points = keys.map((dateKey) => {
    const dayTasks = safeTasks.filter((t) => t.dateKey === dateKey);
    const [y, m, d] = dateKey.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const labelPrimary = dt.toLocaleDateString(locale, { weekday: 'short' });
    const labelSecondary = String(dt.getDate());
    return {
      periodKey: dateKey,
      labelPrimary,
      labelSecondary,
      doneCount: dayTasks.filter((t) => t.done).length,
      totalCount: dayTasks.length,
    };
  });
  const maxBar = Math.max(1, ...points.map((p) => p.doneCount));
  return {
    granularity: 'day',
    points,
    maxBar,
    highlightKey,
  };
}

/** Son `nWeeks` tam hafta (Pzt–Paz), eskiden yeniye */
export function buildWeeklySeries(tasks, nWeeks = 8, locale) {
  const safeTasks = sanitizeTasksForStats(tasks);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonday = mondayOfWeekContaining(today);
  const points = [];

  for (let w = nWeeks - 1; w >= 0; w -= 1) {
    const monday = addDays(currentMonday, -7 * w);
    let doneCount = 0;
    let totalCount = 0;
    for (let i = 0; i < 7; i += 1) {
      const dk = getTodayDateKey(addDays(monday, i));
      const dayList = safeTasks.filter((t) => t.dateKey === dk);
      totalCount += dayList.length;
      doneCount += dayList.filter((t) => t.done).length;
    }
    const sunday = addDays(monday, 6);
    const labelPrimary = `${monday.getDate()} ${monday.toLocaleDateString(locale, { month: 'short' })}`;
    const labelSecondary = `– ${sunday.getDate()} ${sunday.toLocaleDateString(locale, { month: 'short' })}`;
    points.push({
      periodKey: getTodayDateKey(monday),
      labelPrimary,
      labelSecondary,
      doneCount,
      totalCount,
    });
  }

  const maxBar = Math.max(1, ...points.map((p) => p.doneCount));
  const highlightKey = getTodayDateKey(currentMonday);

  return {
    granularity: 'week',
    points,
    maxBar,
    highlightKey,
  };
}

/** Son `nMonths` takvim ayı (eskiden yeniye) */
export function buildMonthlySeries(tasks, nMonths = 6, locale) {
  const safeTasks = sanitizeTasksForStats(tasks);
  const now = new Date();
  const points = [];

  for (let i = nMonths - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const mo = d.getMonth() + 1;
    const prefix = `${y}-${String(mo).padStart(2, '0')}`;
    const monthTasks = safeTasks.filter((t) => t.dateKey.startsWith(`${prefix}-`));
    const totalCount = monthTasks.length;
    const doneCount = monthTasks.filter((t) => t.done).length;
    const labelPrimary = d.toLocaleDateString(locale, { month: 'short' });
    const labelSecondary = String(y);
    points.push({
      periodKey: prefix,
      labelPrimary,
      labelSecondary,
      doneCount,
      totalCount,
    });
  }

  const maxBar = Math.max(1, ...points.map((p) => p.doneCount));
  const highlightKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return {
    granularity: 'month',
    points,
    maxBar,
    highlightKey,
  };
}

/** Son `nYears` takvim yılı (eskiden yeniye) */
export function buildYearlySeries(tasks, nYears = 5, locale) {
  const safeTasks = sanitizeTasksForStats(tasks);
  const currentY = new Date().getFullYear();
  const points = [];

  for (let i = nYears - 1; i >= 0; i -= 1) {
    const y = currentY - i;
    const prefix = `${y}-`;
    const yearTasks = safeTasks.filter((t) => typeof t.dateKey === 'string' && t.dateKey.startsWith(prefix));
    const totalCount = yearTasks.length;
    const doneCount = yearTasks.filter((t) => t.done).length;
    points.push({
      periodKey: String(y),
      labelPrimary: new Date(y, 0, 1).toLocaleDateString(locale, { year: 'numeric' }),
      labelSecondary: null,
      doneCount,
      totalCount,
    });
  }

  const maxBar = Math.max(1, ...points.map((p) => p.doneCount));
  const highlightKey = String(currentY);

  return {
    granularity: 'year',
    points,
    maxBar,
    highlightKey,
  };
}

export function buildTaskStats(tasks) {
  const safeTasks = sanitizeTasksForStats(tasks);
  const total = safeTasks.length;
  const done = safeTasks.filter((t) => t.done).length;
  const pending = total - done;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  const todayKey = getTodayDateKey();
  const todayTasks = safeTasks.filter((t) => t.dateKey === todayKey);
  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayTotal = todayTasks.length;

  const weekKeys = getWeekDaysContaining(new Date()).map((d) => getTodayDateKey(d));
  const weekTasks = safeTasks.filter((t) => weekKeys.includes(t.dateKey));
  const weekDone = weekTasks.filter((t) => t.done).length;
  const weekTotal = weekTasks.length;

  const priorityCounts = { high: 0, medium: 0, low: 0, other: 0 };
  for (const t of safeTasks) {
    if (t.priority === 'high') priorityCounts.high += 1;
    else if (t.priority === 'medium') priorityCounts.medium += 1;
    else if (t.priority === 'low') priorityCounts.low += 1;
    else priorityCounts.other += 1;
  }

  return {
    total,
    done,
    pending,
    rate,
    todayKey,
    todayTotal,
    todayDone,
    weekTotal,
    weekDone,
    priorityCounts,
  };
}
