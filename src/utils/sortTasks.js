export function timeToMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
  if (!m) return 24 * 60;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return 24 * 60;
  return h * 60 + min;
}

export function sortTasksByTime(tasks) {
  if (!Array.isArray(tasks)) return [];
  const list = tasks.filter((t) => t != null && typeof t === 'object');
  return [...list].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}
