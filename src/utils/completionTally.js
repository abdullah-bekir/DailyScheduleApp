import AsyncStorage from '@react-native-async-storage/async-storage';

export const COMPLETION_TALLY_KEY = '@dailyschedule/completion_tally_v1';
const COMPLETION_TALLY_MIGRATION_KEY = '@dailyschedule/completion_tally_v1_migrated_user';

function userScopedTallyKey(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  return id ? `${COMPLETION_TALLY_KEY}:${id}` : COMPLETION_TALLY_KEY;
}

async function migrateLegacyTallyForUser(userId) {
  const id = typeof userId === 'string' ? userId.trim() : '';
  if (!id) return;

  const targetKey = userScopedTallyKey(id);
  const [migrationOwner, target, legacy] = await Promise.all([
    AsyncStorage.getItem(COMPLETION_TALLY_MIGRATION_KEY),
    AsyncStorage.getItem(targetKey),
    AsyncStorage.getItem(COMPLETION_TALLY_KEY),
  ]);

  if (!migrationOwner && target == null && legacy != null) {
    await AsyncStorage.setItem(targetKey, legacy);
  }
  if (!migrationOwner) {
    await AsyncStorage.setItem(COMPLETION_TALLY_MIGRATION_KEY, id);
  }
}

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

export async function loadCompletionTally(userId) {
  try {
    await migrateLegacyTallyForUser(userId);
    const raw = await AsyncStorage.getItem(userScopedTallyKey(userId));
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n) || n < 0) return 0;
    return n;
  } catch {
    return 0;
  }
}

export function saveCompletionTally(n, userId) {
  return AsyncStorage.setItem(userScopedTallyKey(userId), String(n)).catch(() => {});
}
