import {
  motivationWhenAllDone,
  motivationWhenEmpty,
  motivationWhenInProgress,
} from '../data/dailyMotivationQuotes';

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

export function getMotivationQuotesForStats(stats) {
  const { total, remaining } = stats;
  if (total === 0) return motivationWhenEmpty;
  if (remaining === 0) return motivationWhenAllDone;
  return motivationWhenInProgress;
}

/**
 * Bugün için tek bir motivasyon sözü (tarihe göre sabit).
 *
 * @param {string} dateKey YYYY-MM-DD
 * @param {{ total: number; remaining: number }} stats
 */
export function pickDailyMotivationQuote(dateKey, stats) {
  const pool = getMotivationQuotesForStats(stats);
  const idx = getDailyQuoteIndex(dateKey, pool.length);
  return pool[idx];
}
