/**
 * Ana sayfa «Bugünün ilerlemesi» — Ayarlar’daki günlük hedef (3, 5, 8, 10, 15, 20).
 *
 * Bugün eklenen görev sayısı ÷ hedef → %0–100 (hedefe ulaşınca veya geçince %100).
 * Öncelik (yüksek / orta / düşük) ve tik durumu bu çubuğu etkilemez.
 */
export function getCombinedDailyProgress(taskList, planGoal) {
  const n = Array.isArray(taskList) ? taskList.length : 0;
  if (n === 0) return 0;

  const goal = Math.max(1, Number(planGoal) || 1);
  if (n >= goal) return 100;

  return Math.min(99, Math.round((n / goal) * 100));
}

/** Ayarladığın günlük görev sayısı kadar bugün için görev eklendi mi */
export function isDailyPlanProgressComplete(taskList, planGoal) {
  const n = Array.isArray(taskList) ? taskList.length : 0;
  if (n === 0) return false;
  const goal = Math.max(1, Number(planGoal) || 1);
  return n >= goal;
}
