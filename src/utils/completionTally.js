import AsyncStorage from '@react-native-async-storage/async-storage';

export const COMPLETION_TALLY_KEY = '@dailyschedule/completion_tally_v1';

/** Her tamamlamada eklenen puan (önceliğe göre) */
export const COMPLETION_WEIGHT = {
  high: 3,
  medium: 2,
  low: 1,
};

/** İlerleme çubuğu: bu kadar puanda bir “basamak” tamamlanır */
export const TIER_SIZE = 10;

export function completionWeightForPriority(priority) {
  return COMPLETION_WEIGHT[priority] ?? 1;
}

export async function loadCompletionTally() {
  try {
    const raw = await AsyncStorage.getItem(COMPLETION_TALLY_KEY);
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 0) return 0;
    return n;
  } catch {
    return 0;
  }
}

export function saveCompletionTally(n) {
  return AsyncStorage.setItem(COMPLETION_TALLY_KEY, String(n)).catch(() => {});
}
