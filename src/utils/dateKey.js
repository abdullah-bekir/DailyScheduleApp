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

function resolveLocale(locale) {
  return locale && typeof locale === 'string' ? locale : 'tr-TR';
}

/** Ana sayfa gibi yerler için kısa etiket */
export function formatTodayCompactLabel(d = new Date(), locale = 'tr-TR') {
  const loc = resolveLocale(locale);
  const s = d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Üst şerit: büyük harf tarih satırı */
export function formatTodayHeaderCapsLine(d = new Date(), locale = 'tr-TR') {
  const loc = resolveLocale(locale);
  const weekday = d.toLocaleDateString(loc, { weekday: 'long' }).toLocaleUpperCase(loc);
  const day = d.getDate();
  const month = d.toLocaleDateString(loc, { month: 'long' }).toLocaleUpperCase(loc);
  const year = d.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
}

/** Uzun tarih etiketi */
export function formatDateKeyForDisplay(dateKey, locale = 'tr-TR') {
  if (!isValidDateKey(dateKey)) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(resolveLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
