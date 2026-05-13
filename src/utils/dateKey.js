/** Yerel takvime göre YYYY-MM-DD */
export function getTodayDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isValidDateKey(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/** Hafta okları için: aynı hafta içi günü koruyarak önceki/sonraki haftaya taşır */
export function addDaysToDateKey(dateKey, deltaDays) {
  if (!isValidDateKey(dateKey)) return getTodayDateKey();
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return getTodayDateKey(dt);
}

/** Ana sayfa gibi yerler için kısa etiket (ör. Cuma, 1 May) */
export function formatTodayCompactLabel(d = new Date()) {
  const s = d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Üst şerit: SALI, 9 MAYIS 2026 (tr-TR büyük harf) */
export function formatTodayHeaderCapsLine(d = new Date()) {
  const weekday = d.toLocaleDateString('tr-TR', { weekday: 'long' }).toLocaleUpperCase('tr-TR');
  const day = d.getDate();
  const month = d.toLocaleDateString('tr-TR', { month: 'long' }).toLocaleUpperCase('tr-TR');
  const year = d.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

/** tr-TR uzun tarih etiketi */
export function formatDateKeyForDisplay(dateKey) {
  if (!isValidDateKey(dateKey)) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Pazartesi başlangıçlı haftanın 7 günü (Date nesneleri, saat sıfır) */
export function getWeekDaysContaining(date = new Date()) {
  const cur = new Date(date);
  cur.setHours(0, 0, 0, 0);
  const day = cur.getDay();
  const diffFromMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(cur);
  monday.setDate(cur.getDate() + diffFromMonday);
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    days.push(x);
  }
  return days;
}
