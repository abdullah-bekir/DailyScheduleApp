import { MOTIVATION_QUOTES_BY_LANGUAGE } from '../data/dailyMotivationQuotes';

const FALLBACK_LANGUAGE = 'en';
const SAFE_FALLBACK_LANGUAGE = 'tr';

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDailyQuoteIndex(dateKey, poolLength) {
  if (!poolLength) return 0;
  return hashString(dateKey) % poolLength;
}

export function getMotivationQuotesForStats(stats, language = SAFE_FALLBACK_LANGUAGE) {
  const { total, remaining } = stats;
  const languageQuotes = MOTIVATION_QUOTES_BY_LANGUAGE[language]
    ?? MOTIVATION_QUOTES_BY_LANGUAGE[FALLBACK_LANGUAGE]
    ?? MOTIVATION_QUOTES_BY_LANGUAGE[SAFE_FALLBACK_LANGUAGE];
  if (total === 0) return languageQuotes.empty;
  if (remaining === 0) return languageQuotes.allDone;
  return languageQuotes.inProgress;
}

/**
 * Bugün için tek bir motivasyon sözü (tarihe göre sabit).
 *
 * @param {string} dateKey YYYY-MM-DD
 * @param {{ total: number; remaining: number }} stats
 * @param {string} [language] App language code
 */
export function pickDailyMotivationQuote(dateKey, stats, language = SAFE_FALLBACK_LANGUAGE) {
  const pool = getMotivationQuotesForStats(stats, language);
  const idx = getDailyQuoteIndex(dateKey, pool.length);
  return pool[idx];
}
